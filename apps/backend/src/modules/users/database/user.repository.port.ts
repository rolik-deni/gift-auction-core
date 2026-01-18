import { RepositoryPort } from '@libs/ddd'

import { UserEntity } from '../domain/user.entity'

export type UserFindOneQuery = {
    id?: string
}

export type UserRepositoryPort = RepositoryPort<UserEntity, UserFindOneQuery>
