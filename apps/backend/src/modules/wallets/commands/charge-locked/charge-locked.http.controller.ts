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

import { ChargeLockedCommand } from './charge-locked.command'
import { ChargeLockedRequestDto } from './charge-locked.request.dto'

@ApiExcludeController()
@ApiTags('wallets')
@Controller('wallets')
export class ChargeLockedHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Charge locked funds' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post('charge-locked')
    async charge(@Body() body: ChargeLockedRequestDto): Promise<IdResponse> {
        const command = new ChargeLockedCommand(body)
        const result = await this._commandBus.execute<
            ChargeLockedCommand,
            AggregateID
        >(command)

        return new IdResponse(result)
    }
}
