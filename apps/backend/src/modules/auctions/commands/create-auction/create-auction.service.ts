import { AggregateID, Money } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { AUCTION_REPOSITORY } from '../../auction.di-tokens'
import type { AuctionRepositoryPort } from '../../database'
import { AuctionEntity } from '../../domain'
import { CreateAuctionCommand } from './create-auction.command'

@CommandHandler(CreateAuctionCommand)
export class CreateAuctionService implements ICommandHandler<
    CreateAuctionCommand,
    AggregateID
> {
    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
    ) {}

    async execute(command: CreateAuctionCommand): Promise<AggregateID> {
        const entryPrice = Money.create(
            command.entryPriceAmount,
            command.entryPriceCurrency ?? 'XTR',
        )
        const title = command.title?.trim() || command.giftName
        const auction = AuctionEntity.create({
            title,
            giftName: command.giftName,
            totalItems: command.totalItems,
            roundsTotal: command.roundsTotal,
            roundDurationSeconds: command.roundDurationSeconds,
            entryPrice,
        })

        await this._auctionRepository.save(auction)

        return auction.id
    }
}
