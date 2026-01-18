import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { UnlockFundsCommand } from './unlock-funds.command'
import { UnlockFundsRequestDto } from './unlock-funds.request.dto'

@Controller('wallets')
export class UnlockFundsHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Unlock wallet funds' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post('unlock')
    async unlock(@Body() body: UnlockFundsRequestDto): Promise<IdResponse> {
        const command = new UnlockFundsCommand(body)
        const result = await this._commandBus.execute<
            UnlockFundsCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
