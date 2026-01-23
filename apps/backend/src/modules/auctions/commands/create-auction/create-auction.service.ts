import { AggregateID, Money } from '@libs/ddd'
import { getLogContext, inspectInline } from '@libs/utils'
import { Inject, Logger } from '@nestjs/common'
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
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        CreateAuctionService.name,
    )

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

        this._logger.log(
            `Auction created (${inspectInline({ id: auction.id })})`,
            this._getLogContext(this.execute.name),
        )

        return auction.id
    }
}
