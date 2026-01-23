import { faker } from '@faker-js/faker'
import { AggregateID } from '@libs/ddd'
import { getLogContext, inspectInline } from '@libs/utils'
import { Inject, Logger } from '@nestjs/common'
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
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        CreateUserService.name,
    )

    constructor(
        @Inject(USER_REPOSITORY)
        protected readonly userRepository: UserRepositoryPort,
    ) {}

    async execute(command: CreateUserCommand): Promise<AggregateID> {
        const user = UserEntity.create({
            name: command.name ?? faker.person.fullName(),
        })

        await this.userRepository.save(user)

        this._logger.log(
            `User created (${inspectInline({ id: user.id })})`,
            this._getLogContext(this.execute.name),
        )

        return user.id
    }
}
