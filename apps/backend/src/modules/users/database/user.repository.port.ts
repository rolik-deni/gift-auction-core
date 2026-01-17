import { RepositoryPort } from '@libs/ddd'

import { UserEntity } from '../domain/user.entity'

export type UserRepositoryPort = RepositoryPort<UserEntity>
