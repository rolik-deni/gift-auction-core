import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import type { UserRepositoryPort } from '../../../users/database'
import { USER_REPOSITORY } from '../../../users/user.di-tokens'
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
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: UserRepositoryPort,
    ) {}

    async execute(
        query: GetAuctionHistoryQuery,
    ): Promise<GetAuctionHistoryResponseDto> {
        const rounds = await this._roundResultRepository.findRoundResults(
            query.auctionId,
        )
        const userIds = rounds.flatMap((round) =>
            round.winners.map((winner) => winner.userId),
        )
        const uniqueUserIds = Array.from(new Set(userIds))
        const userNameEntries = await Promise.all(
            uniqueUserIds.map(async (userId) => {
                const user = await this._userRepository.findOne(
                    { id: userId },
                    false,
                )
                return [userId, user?.getProps().name] as const
            }),
        )
        const userNameMap = new Map(userNameEntries)

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
                        userName: userNameMap.get(winner.userId) ?? 'Unknown',
                        bidAmount: winner.bidAmount,
                        bidPlacedAt: placedAt.toISOString(),
                    }
                }),
            }),
        )

        return { rounds: responseRounds }
    }
}
