import { ResponseBase } from '@libs/api/response.base'
import { ApiProperty } from '@nestjs/swagger'

import { UserEntity } from '../domain/user.entity'

export class UserResponseDto extends ResponseBase {
    constructor(user: UserEntity) {
        super(user.getProps())
    }

    @ApiProperty({ example: 'Cynthia Beatty' })
    name: string
}
