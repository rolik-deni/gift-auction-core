import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { AuctionRoundResultRepository } from '../../database'
import { GetAuctionHistoryQuery } from './get-auction-history.query'
import {
    AuctionHistoryRoundDto,
    GetAuctionHistoryResponseDto,
} from './get-auction-history.response.dto'

@QueryHandler(GetAuctionHistoryQuery)
export class GetAuctionHistoryService implements IQueryHandler<
    GetAuctionHistoryQuery,
    GetAuctionHistoryResponseDto
> {
    constructor(
        private readonly _roundResultRepository: AuctionRoundResultRepository,
    ) {}

    async execute(
        query: GetAuctionHistoryQuery,
    ): Promise<GetAuctionHistoryResponseDto> {
        const rounds = await this._roundResultRepository.findRoundResults(
            query.auctionId,
        )
        const responseRounds: AuctionHistoryRoundDto[] = rounds.map(
            (round) => ({
                roundNumber: round.roundNumber,
                winners: round.winners.map((winner) => {
                    const placedAt =
                        winner.bidPlacedAt instanceof Date
                            ? winner.bidPlacedAt
                            : new Date(winner.bidPlacedAt)
                    return {
                        rank: winner.rank,
                        userId: winner.userId,
                        bidAmount: winner.bidAmount,
                        bidPlacedAt: placedAt.toISOString(),
                    }
                }),
            }),
        )

        return { rounds: responseRounds }
    }
}
