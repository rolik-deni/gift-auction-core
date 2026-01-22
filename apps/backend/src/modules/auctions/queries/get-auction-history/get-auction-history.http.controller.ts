import { Controller, Get, Param } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { GetAuctionHistoryQuery } from './get-auction-history.query'
import { GetAuctionHistoryResponseDto } from './get-auction-history.response.dto'

@ApiTags('auctions')
@Controller('auctions')
export class GetAuctionHistoryHttpController {
    constructor(private readonly _queryBus: QueryBus) {}

    @Get(':auctionId/history')
    @ApiOperation({ summary: 'Get auction round history' })
    @ApiResponse({
        status: 200,
        type: GetAuctionHistoryResponseDto,
    })
    async execute(
        @Param('auctionId') auctionId: string,
    ): Promise<GetAuctionHistoryResponseDto> {
        return await this._queryBus.execute(
            new GetAuctionHistoryQuery(auctionId),
        )
    }
}
