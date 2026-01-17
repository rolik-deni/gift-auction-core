import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Ok } from 'oxide.ts'

import { DepositFundsCommand } from './deposit-funds.command'
import { DepositFundsRequestDto } from './deposit-funds.request.dto'

@Controller('wallets')
export class DepositFundsHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Deposit funds (debug)' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post('deposit')
    async deposit(@Body() body: DepositFundsRequestDto): Promise<IdResponse> {
        const command = new DepositFundsCommand(body)
        const result = await this._commandBus.execute<
            DepositFundsCommand,
            Ok<AggregateID>
        >(command)

        return new IdResponse(result.unwrap())
    }
}
