import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { QueryBus } from '@nestjs/cqrs'

import { GetUserQuery } from './get-user.query'
import { GetUserResponseDto } from './get-user.response.dto'

@ApiTags('users')
@Controller('users')
export class GetUserHttpController {
    constructor(private readonly _queryBus: QueryBus) {}

    @Get(':userId')
    @ApiOperation({ summary: 'Get user by id' })
    @ApiResponse({ status: 200, type: GetUserResponseDto })
    async execute(
        @Param('userId') userId: string,
    ): Promise<GetUserResponseDto> {
        return await this._queryBus.execute(new GetUserQuery(userId))
    }
}
