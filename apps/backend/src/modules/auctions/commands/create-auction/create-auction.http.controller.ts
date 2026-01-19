import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { CreateAuctionCommand } from './create-auction.command'
import { CreateAuctionRequestDto } from './create-auction.request.dto'

@Controller('auctions')
export class CreateAuctionHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Create auction' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post()
    async create(@Body() body: CreateAuctionRequestDto): Promise<IdResponse> {
        const command = new CreateAuctionCommand(body)
        const result = await this._commandBus.execute<
            CreateAuctionCommand,
            AggregateID
        >(command)

        return new IdResponse(result)
    }
}
