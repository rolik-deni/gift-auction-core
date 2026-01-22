import { Controller, Get, Param } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuctionResponseDto } from '../../dtos'
import { GetAuctionQuery } from './get-auction.query'

@ApiTags('auctions')
@Controller('auctions')
export class GetAuctionHttpController {
    constructor(private readonly _queryBus: QueryBus) {}

    @ApiOperation({ summary: 'Get auction' })
    @ApiResponse({ status: 200, type: AuctionResponseDto })
    @Get(':auctionId')
    async getAuction(
        @Param('auctionId') auctionId: string,
    ): Promise<AuctionResponseDto> {
        const query = new GetAuctionQuery(auctionId)
        const result = await this._queryBus.execute<
            GetAuctionQuery,
            AuctionResponseDto
        >(query)
        return result
    }
}
