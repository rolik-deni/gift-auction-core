import { AggregateID } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import { AUCTION_REPOSITORY } from '../../auction.di-tokens'
import type { AuctionRepositoryPort } from '../../database'
import { StartAuctionCommand } from './start-auction.command'

@CommandHandler(StartAuctionCommand)
export class StartAuctionService implements ICommandHandler<
    StartAuctionCommand,
    AggregateID
> {
    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
    ) {}

    async execute(command: StartAuctionCommand): Promise<AggregateID> {
        const auction = await this._auctionRepository.findOne(
            { id: command.auctionId },
            true,
        )

        auction.start()
        await this._auctionRepository.save(auction)

        return auction.id
    }
}
