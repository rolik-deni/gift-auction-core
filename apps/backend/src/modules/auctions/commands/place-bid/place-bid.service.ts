import { AggregateID, Money } from '@libs/ddd'
import { ArgumentInvalidException } from '@libs/exceptions'
import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BigNumber } from 'bignumber.js'

import { getLogContext, inspectInline } from '../../../../libs/utils'
import { AUCTION_REPOSITORY, WALLET_PORT } from '../../auction.di-tokens'
import type { AuctionRepositoryPort } from '../../database'
import { AuctionStatus } from '../../domain'
import type { WalletPort } from '../../domain/ports/wallet.port'
import { BiddingRepository } from '../../infrastructure'
import { PlaceBidCommand } from './place-bid.command'

const toNumber = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const ANTI_SNIPING_THRESHOLD_MS = toNumber(
    process.env.AUCTIONS_ANTI_SNIPING_THRESHOLD_MS,
    30_000,
)
const ANTI_SNIPING_EXTENSION_SEC = toNumber(
    process.env.AUCTIONS_ANTI_SNIPING_EXTENSION_SEC,
    30,
)

@CommandHandler(PlaceBidCommand)
export class PlaceBidService implements ICommandHandler<
    PlaceBidCommand,
    AggregateID
> {
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        PlaceBidService.name,
    )

    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
        private readonly _biddingRepository: BiddingRepository,
        @Inject(WALLET_PORT)
        private readonly _walletPort: WalletPort,
    ) {}

    async execute(command: PlaceBidCommand): Promise<AggregateID> {
        const auction = await this._auctionRepository.findOne(
            { id: command.auctionId },
            true,
        )

        if (auction.status !== AuctionStatus.ACTIVE) {
            throw new ArgumentInvalidException('Auction is not active')
        }

        const existingBid = await this._biddingRepository.getUserBid(
            command.auctionId,
            command.userId,
        )
        const oldAmount = existingBid
            ? new BigNumber(existingBid.amount)
            : new BigNumber(0)

        const newAmount = new BigNumber(command.amount)

        const isInvalidBidAmount =
            !newAmount.isFinite() ||
            newAmount.isNaN() ||
            newAmount.isLessThanOrEqualTo(0)

        if (isInvalidBidAmount) {
            throw new ArgumentInvalidException(
                'Bid amount must be a positive number',
            )
        }

        if (!existingBid && newAmount.isLessThan(auction.entryPrice.amount)) {
            throw new ArgumentInvalidException('Bid is below the entry price')
        }

        if (newAmount.isLessThanOrEqualTo(oldAmount)) {
            throw new ArgumentInvalidException('Bid must be higher')
        }

        const delta = newAmount.minus(oldAmount)
        if (delta.isGreaterThan(0)) {
            await this._walletPort.lockFunds(
                command.userId,
                Money.create(delta, auction.getProps().entryPrice.currency),
            )
        }

        await this._biddingRepository.saveBid(
            command.auctionId,
            command.userId,
            newAmount.toFixed(),
            new Date(),
        )

        this._logger.debug(
            `Bid placed (${inspectInline({
                auctionId: command.auctionId,
                userId: command.userId,
                amount: newAmount.toFixed(),
            })}).`,
            this._getLogContext(this.execute.name),
        )

        const endsAt = auction.currentRoundEndsAt

        const shouldCheckExtend =
            !!endsAt &&
            endsAt.getTime() - Date.now() < ANTI_SNIPING_THRESHOLD_MS

        if (shouldCheckExtend && auction.itemsPerRound > 0) {
            const rank = await this._biddingRepository.getUserRank(
                command.auctionId,
                command.userId,
            )

            if (rank !== null && rank < auction.itemsPerRound) {
                auction.extendRound(ANTI_SNIPING_EXTENSION_SEC)
                const newEndsAt = auction.currentRoundEndsAt
                await this._auctionRepository.extendRound(auction.id, newEndsAt)
            }
        }

        return auction.id
    }
}
