import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import type { UserRepositoryPort } from '../../database'
import { USER_REPOSITORY } from '../../user.di-tokens'
import { GetUserQuery } from './get-user.query'
import { GetUserResponseDto } from './get-user.response.dto'

@QueryHandler(GetUserQuery)
export class GetUserService implements IQueryHandler<
    GetUserQuery,
    GetUserResponseDto
> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: UserRepositoryPort,
    ) {}

    async execute(query: GetUserQuery): Promise<GetUserResponseDto> {
        const user = await this._userRepository.findOne(
            { id: query.userId },
            true,
        )
        const props = user.getProps()
        return new GetUserResponseDto({ id: props.id, name: props.name })
    }
}
