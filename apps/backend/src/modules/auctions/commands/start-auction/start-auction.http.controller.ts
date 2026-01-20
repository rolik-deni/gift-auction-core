import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Controller, Param, Patch } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { StartAuctionCommand } from './start-auction.command'

@Controller('auctions')
export class StartAuctionHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Start auction' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Patch(':id/start')
    async start(@Param('id') auctionId: string): Promise<IdResponse> {
        const command = new StartAuctionCommand({ auctionId })
        const result = await this._commandBus.execute<
            StartAuctionCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
