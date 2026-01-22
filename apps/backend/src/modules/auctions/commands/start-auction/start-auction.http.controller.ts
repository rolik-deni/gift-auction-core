import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Controller, Param, Patch } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { StartAuctionCommand } from './start-auction.command'

@ApiTags('auctions')
@Controller('auctions')
export class StartAuctionHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Start auction' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Patch(':auctionId/start')
    async start(@Param('auctionId') auctionId: string): Promise<IdResponse> {
        const command = new StartAuctionCommand({ auctionId })
        const result = await this._commandBus.execute<
            StartAuctionCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
