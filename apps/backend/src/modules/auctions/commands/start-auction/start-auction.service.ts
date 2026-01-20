import { AggregateID } from '@libs/ddd'
import { getLogContext } from '@libs/utils'
import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import {
    AUCTION_REPOSITORY,
    AUCTION_SCHEDULER_PORT,
} from '../../auction.di-tokens'
import type { AuctionRepositoryPort } from '../../database'
import type { AuctionSchedulerPort } from '../../domain/ports/auction-scheduler.port'
import { StartAuctionCommand } from './start-auction.command'

@CommandHandler(StartAuctionCommand)
export class StartAuctionService implements ICommandHandler<
    StartAuctionCommand,
    AggregateID
> {
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        StartAuctionService.name,
    )

    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
        @Inject(AUCTION_SCHEDULER_PORT)
        private readonly _scheduler: AuctionSchedulerPort,
    ) {}

    async execute(command: StartAuctionCommand): Promise<AggregateID> {
        const auction = await this._auctionRepository.findOne(
            { id: command.auctionId },
            true,
        )

        auction.start()
        await this._auctionRepository.save(auction)

        if (auction.currentRoundEndsAt) {
            this._logger.log(
                `Auction started. Auction ID: ${auction.id}, round: ` +
                    `${auction.currentRoundNumber}/${auction.roundsTotal}, ` +
                    `round ends at: ${auction.currentRoundEndsAt?.toUTCString()}`,
                this._getLogContext(this.execute.name),
            )

            await this._scheduler.scheduleRoundEnd(
                auction.id,
                auction.currentRoundNumber,
                auction.currentRoundEndsAt,
            )
        }

        return auction.id
    }
}
