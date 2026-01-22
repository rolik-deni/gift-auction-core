import { Controller, Get, Param, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetLeaderboardQuery } from './get-leaderboard.query'
import { GetLeaderboardResponseDto } from './get-leaderboard.response.dto'

@ApiTags('auctions')
@Controller('auctions')
export class GetLeaderboardHttpController {
    constructor(private readonly _queryBus: QueryBus) {}

    @Get(':auctionId/leaderboard')
    @ApiOperation({ summary: 'Get auction leaderboard' })
    @ApiResponse({ status: 200, type: GetLeaderboardResponseDto })
    async execute(
        @Param('auctionId') auctionId: string,
        @Query('userId') userId?: string,
    ): Promise<GetLeaderboardResponseDto> {
        return await this._queryBus.execute(
            new GetLeaderboardQuery(auctionId, userId),
        )
    }
}
