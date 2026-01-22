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

import { LockFundsCommand } from './lock-funds.command'
import { LockFundsRequestDto } from './lock-funds.request.dto'

@ApiExcludeController()
@ApiTags('wallets')
@Controller('wallets')
export class LockFundsHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Lock wallet funds' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post('lock')
    async lock(@Body() body: LockFundsRequestDto): Promise<IdResponse> {
        const command = new LockFundsCommand(body)
        const result = await this._commandBus.execute<
            LockFundsCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
