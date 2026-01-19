import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Param, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { PlaceBidCommand } from './place-bid.command'
import { PlaceBidRequestDto } from './place-bid.request.dto'

@Controller('auctions')
export class PlaceBidHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Place bid' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post(':id/bid')
    async placeBid(
        @Param('id') auctionId: string,
        @Body() body: PlaceBidRequestDto,
    ): Promise<IdResponse> {
        const command = new PlaceBidCommand({
            auctionId,
            userId: body.userId,
            amount: body.amount,
        })
        const result = await this._commandBus.execute<
            PlaceBidCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
