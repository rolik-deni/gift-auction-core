import { faker } from '@faker-js/faker'
import { AggregateID } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import type { UserRepositoryPort } from '../../database'
import { UserEntity } from '../../domain'
import { USER_REPOSITORY } from '../../user.di-tokens'
import { CreateUserCommand } from './create-user.command'

@CommandHandler(CreateUserCommand)
export class CreateUserService implements ICommandHandler<
    CreateUserCommand,
    AggregateID
> {
    constructor(
        @Inject(USER_REPOSITORY)
        protected readonly userRepository: UserRepositoryPort,
    ) {}

    async execute(command: CreateUserCommand): Promise<AggregateID> {
        const user = UserEntity.create({
            name: command.name ?? faker.person.fullName(),
        })

        await this.userRepository.save(user)
        return user.id
    }
}
