import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import {
    ApiExcludeController,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

import { CreateWalletCommand } from './create-wallet.command'
import { CreateWalletRequestDto } from './create-wallet.request.dto'

@ApiExcludeController()
@ApiTags('wallets')
@Controller('wallets')
export class CreateWalletHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Create wallet' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post()
    async create(@Body() body: CreateWalletRequestDto): Promise<IdResponse> {
        const command = new CreateWalletCommand(body)
        const result = await this._commandBus.execute<
            CreateWalletCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
