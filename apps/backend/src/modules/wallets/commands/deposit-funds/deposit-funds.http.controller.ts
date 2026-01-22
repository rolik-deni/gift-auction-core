import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { DepositFundsCommand } from './deposit-funds.command'
import { DepositFundsRequestDto } from './deposit-funds.request.dto'

@ApiTags('wallets')
@Controller('wallets')
export class DepositFundsHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Deposit funds' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post('deposit')
    async deposit(@Body() body: DepositFundsRequestDto): Promise<IdResponse> {
        const command = new DepositFundsCommand(body)
        const result = await this._commandBus.execute<
            DepositFundsCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
