import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import type { UserRepositoryPort } from '../../../users/database'
import { USER_REPOSITORY } from '../../../users/user.di-tokens'
import { AUCTION_REPOSITORY } from '../../auction.di-tokens'
import type { AuctionRepositoryPort } from '../../database'
import { BiddingRepository } from '../../infrastructure'
import { GetLeaderboardQuery } from './get-leaderboard.query'
import {
    GetLeaderboardResponseDto,
    LeaderboardEntryDto,
    LeaderboardMeDto,
} from './get-leaderboard.response.dto'

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardService implements IQueryHandler<
    GetLeaderboardQuery,
    GetLeaderboardResponseDto
> {
    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
        private readonly _biddingRepository: BiddingRepository,
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: UserRepositoryPort,
    ) {}

    async execute(
        query: GetLeaderboardQuery,
    ): Promise<GetLeaderboardResponseDto> {
        const auction = await this._auctionRepository.findOne(
            { id: query.auctionId },
            true,
        )

        const topBidders = await this._biddingRepository.getTopBidders(
            auction.id,
            3,
        )
        const top: LeaderboardEntryDto[] = await Promise.all(
            topBidders.map(async (bidder, index) => {
                const user = await this._userRepository.findOne(
                    { id: bidder.userId },
                    false,
                )
                return {
                    rank: index + 1,
                    userId: bidder.userId,
                    userName: user?.getProps().name ?? 'Unknown',
                    amount: bidder.amount,
                    bidPlacedAt: bidder.bidPlacedAt.toISOString(),
                }
            }),
        )

        if (!query.userId) {
            return { top, me: null }
        }

        const rank = await this._biddingRepository.getUserRank(
            auction.id,
            query.userId,
        )
        if (rank === null) {
            return { top, me: null }
        }

        const bid = await this._biddingRepository.getUserBid(
            auction.id,
            query.userId,
        )
        if (!bid) {
            return { top, me: null }
        }

        const me: LeaderboardMeDto = {
            rank: rank + 1,
            amount: bid.amount,
            isWinning: rank < auction.itemsPerRound,
            bidPlacedAt: bid.bidPlacedAt.toISOString(),
        }

        return { top, me }
    }
}
