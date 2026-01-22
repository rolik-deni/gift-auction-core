import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateUserCommand } from './create-user.command'
import { CreateUserRequestDto } from './create-user.request.dto'

@ApiTags('users')
@Controller('users')
export class CreateUserHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post()
    async create(@Body() body: CreateUserRequestDto): Promise<IdResponse> {
        const command = new CreateUserCommand(body)
        const result = await this._commandBus.execute<
            CreateUserCommand,
            AggregateID
        >(command)
        return new IdResponse(result)
    }
}
