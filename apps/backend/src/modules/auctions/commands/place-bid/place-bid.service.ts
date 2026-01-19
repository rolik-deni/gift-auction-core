import { AggregateID, Money } from '@libs/ddd'
import { ArgumentInvalidException } from '@libs/exceptions'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BigNumber } from 'bignumber.js'

import { AUCTION_REPOSITORY, PAYMENT_PORT } from '../../auction.di-tokens'
import type { AuctionRepositoryPort } from '../../database'
import { AuctionStatus } from '../../domain'
import type { PaymentPort } from '../../domain/ports/payment.port'
import { BiddingRepository } from '../../infrastructure'
import { PlaceBidCommand } from './place-bid.command'

@CommandHandler(PlaceBidCommand)
export class PlaceBidService implements ICommandHandler<
    PlaceBidCommand,
    AggregateID
> {
    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
        private readonly _biddingRepository: BiddingRepository,
        @Inject(PAYMENT_PORT)
        private readonly _paymentPort: PaymentPort,
    ) {}

    async execute(command: PlaceBidCommand): Promise<AggregateID> {
        const auction = await this._auctionRepository.findOne(
            { id: command.auctionId },
            true,
        )

        if (auction.status !== AuctionStatus.ACTIVE) {
            throw new ArgumentInvalidException('Auction is not active')
        }

        const endsAt = auction.currentRoundEndsAt
        if (endsAt) {
            auction.extendRound(300)
            const newEndsAt = auction.currentRoundEndsAt

            await this._auctionRepository.extendRound(
                command.auctionId,
                newEndsAt,
            )
        }

        const existingBid = await this._biddingRepository.getUserBid(
            command.auctionId,
            command.userId,
        )
        const oldAmount = existingBid
            ? new BigNumber(existingBid)
            : new BigNumber(0)

        const newAmount = new BigNumber(command.amount)

        if (
            !newAmount.isFinite() ||
            newAmount.isNaN() ||
            newAmount.isLessThanOrEqualTo(0)
        ) {
            throw new ArgumentInvalidException(
                'Bid amount must be a positive number',
            )
        }

        if (newAmount.isLessThanOrEqualTo(oldAmount)) {
            throw new ArgumentInvalidException('Bid must be higher')
        }

        const delta = newAmount.minus(oldAmount)
        if (delta.isGreaterThan(0)) {
            await this._paymentPort.lockFunds(
                command.userId,
                Money.create(delta, auction.getProps().entryPrice.currency),
            )
        }

        await this._biddingRepository.saveBid(
            command.auctionId,
            command.userId,
            newAmount.toFixed(),
        )

        return auction.id
    }
}
