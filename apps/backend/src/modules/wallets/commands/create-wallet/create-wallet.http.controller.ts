import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Ok } from 'oxide.ts'

import { CreateWalletCommand } from './create-wallet.command'
import { CreateWalletRequestDto } from './create-wallet.request.dto'

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
            Ok<AggregateID>
        >(command)

        return new IdResponse(result.unwrap())
    }
}
