/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Money } from '@libs/ddd'
import { getLogContext, inspectInline } from '@libs/utils'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Job, Queue } from 'bullmq'

import { AUCTION_REPOSITORY, WALLET_PORT } from '../auction.di-tokens'
import type { AuctionRepositoryPort } from '../database'
import { AuctionRoundResultRepository } from '../database'
import type { AuctionEntity, WalletPort } from '../domain'
import { AuctionStatus } from '../domain'
import { IBidder } from './bidder.interface'
import { BiddingRepository } from './bidding.repository'

export type SettleRoundJob = {
    auctionId: string
    roundNumber: number
}

@Injectable()
@Processor('auction')
export class AuctionProcessor extends WorkerHost {
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        AuctionProcessor.name,
    )

    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
        private readonly _roundResultRepository: AuctionRoundResultRepository,
        private readonly _biddingRepository: BiddingRepository,
        @Inject(WALLET_PORT)
        private readonly _walletPort: WalletPort,
        @InjectQueue('auction')
        private readonly _queue: Queue,
    ) {
        super()
    }

    async process(job: Job<SettleRoundJob>): Promise<void> {
        try {
            if (job.name !== 'settle-round') {
                return
            }

            const { auctionId, roundNumber } = job.data

            const auction = await this._auctionRepository.findOne(
                {
                    id: auctionId,
                    status: AuctionStatus.ACTIVE,
                    currentRoundNumber: roundNumber,
                },
                false,
            )

            if (!auction || !auction.currentRoundEndsAt) {
                return
            }

            const delay = auction.currentRoundEndsAt.getTime() - Date.now()
            if (delay > 0) {
                await this._rescheduleRound(auction, roundNumber, delay)
                return
            }

            await this._settleAuctionRound(auction)
        } catch (error) {
            this._logger.error(
                error.message,
                error.stack,
                this._getLogContext(this.process.name),
            )
        }
    }

    private async _settleAuctionRound(auction: AuctionEntity): Promise<void> {
        const winners = await this._biddingRepository.getTopBidders(
            auction.id,
            auction.itemsPerRound,
        )

        const roundWinners = winners.map((winner, index) => ({
            rank: index + 1,
            userId: winner.userId,
            bidAmount: winner.amount,
            bidPlacedAt: winner.bidPlacedAt,
        }))
        const saved = await this._roundResultRepository.saveRoundResult(
            auction.id,
            auction.currentRoundNumber,
            roundWinners,
        )
        if (!saved) {
            this._logger.warn(
                `Round result already exists (${inspectInline({
                    id: auction.id,
                    round: `${auction.currentRoundNumber}/${auction.roundsTotal}`,
                })})`,
                this._getLogContext(this._settleAuctionRound.name),
            )
            return
        }

        await this._biddingRepository.removeBidders(
            auction.id,
            winners.map((winner) => winner.userId),
        )

        await this._chargeWinners(winners, auction)

        if (auction.currentRoundNumber === auction.roundsTotal) {
            await this._unlockFundsForAllBidders(auction, winners)
        }

        auction.nextRound()
        await this._auctionRepository.save(auction)

        if (auction.status === AuctionStatus.COMPLETED) {
            this._logger.log(
                `Auction finished (${inspectInline({ id: auction.id })})`,
                this._getLogContext(this._settleAuctionRound.name),
            )
        }

        if (
            auction.status === AuctionStatus.ACTIVE &&
            auction.currentRoundEndsAt
        ) {
            const delay = auction.currentRoundEndsAt.getTime() - Date.now()
            await this._scheduleNextRound(
                auction,
                auction.currentRoundNumber,
                delay,
            )
        }
    }

    private async _chargeWinners(
        winners: IBidder[],
        auction: AuctionEntity,
    ): Promise<void> {
        if (winners.length) {
            this._logger.debug(
                `Round finished, charging winners (${inspectInline({
                    id: auction.id,
                    round: `${auction.currentRoundNumber}/${auction.roundsTotal}`,
                    winners: winners.length,
                })})`,
                this._getLogContext(this._chargeWinners.name),
            )

            await Promise.all(
                winners.map((winner) =>
                    this._walletPort.chargeLocked(
                        winner.userId,
                        Money.create(
                            winner.amount,
                            auction.entryPrice.currency,
                        ),
                    ),
                ),
            )
        }
    }

    private async _unlockFundsForAllBidders(
        auction: AuctionEntity,
        winners: IBidder[],
    ): Promise<void> {
        const excludeWinnerIds = [...new Set(winners.map((w) => w.userId))]
        const chunkSize = 500
        let offset = 0
        let refundedCount = 0

        this._logger.debug(
            `Round finished, refunded funds (${inspectInline({
                id: auction.id,
                round: `${auction.currentRoundNumber}/${auction.roundsTotal}`,
                refunded: refundedCount,
            })})`,
            this._getLogContext(this._unlockFundsForAllBidders.name),
        )

        while (true) {
            const chunk = await this._biddingRepository.getBiddersChunk(
                auction.id,
                offset,
                chunkSize,
                excludeWinnerIds,
            )

            if (!chunk.length) {
                break
            }

            await Promise.all(
                chunk.map((bidder) =>
                    this._walletPort.unlockFunds(
                        bidder.userId,
                        Money.create(
                            bidder.amount,
                            auction.entryPrice.currency,
                        ),
                    ),
                ),
            )
            refundedCount += chunk.length

            offset += chunkSize
        }
    }

    private async _scheduleNextRound(
        auction: AuctionEntity,
        roundNumber: number,
        delayMs: number,
    ): Promise<void> {
        this._logger.log(
            `Round finished, scheduling next round (${inspectInline({
                id: auction.id,
                round: `${auction.currentRoundNumber}/${auction.roundsTotal}`,
                roundEndsAt: auction.currentRoundEndsAt?.toUTCString(),
            })})`,
            this._getLogContext(this._scheduleNextRound.name),
        )

        const delay = Math.max(delayMs, 0)

        await this._queue.add(
            'settle-round',
            { auctionId: auction.id, roundNumber },
            {
                jobId: this._createJobId(auction.id, roundNumber),
                delay,
                removeOnComplete: true,
                removeOnFail: true,
            },
        )
    }

    private async _rescheduleRound(
        auction: AuctionEntity,
        roundNumber: number,
        delayMs: number,
    ): Promise<void> {
        const { id: auctionId } = auction

        this._logger.log(
            `Round extended, rescheduling (${inspectInline({
                id: auction.id,
                round: `${auction.currentRoundNumber}/${auction.roundsTotal}`,
                roundEndsAt: auction.currentRoundEndsAt?.toUTCString(),
            })})`,
            this._getLogContext(this._rescheduleRound.name),
        )

        const delay = Math.max(delayMs, 0)
        await this._queue.add(
            'settle-round',
            { auctionId, roundNumber },
            {
                jobId: `${this._createJobId(auctionId, roundNumber)}-${Date.now()}`,
                delay,
                removeOnComplete: true,
                removeOnFail: true,
            },
        )
    }

    private _createJobId(auctionId: string, roundNumber: number): string {
        return `settle-round-${auctionId}-${roundNumber}`
    }
}
