import { Controller, Get, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuctionResponseDto } from '../../dtos'
import { GetAuctionsQuery } from './get-auctions.query'
import { GetAuctionsRequestDto } from './get-auctions.request.dto'

@ApiTags('auctions')
@Controller('auctions')
export class GetAuctionsHttpController {
    constructor(private readonly _queryBus: QueryBus) {}

    @Get()
    @ApiOperation({ summary: 'Get auctions list' })
    @ApiResponse({ status: 200, type: AuctionResponseDto, isArray: true })
    async execute(
        @Query() query: GetAuctionsRequestDto,
    ): Promise<AuctionResponseDto[]> {
        return await this._queryBus.execute(
            new GetAuctionsQuery({
                ids: query.ids,
                statuses: query.statuses,
                currentRoundNumbers: query.currentRoundNumbers,
            }),
        )
    }
}
