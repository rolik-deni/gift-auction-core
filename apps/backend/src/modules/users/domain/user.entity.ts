import { AggregateID, AggregateRoot, CreateEntityProps } from '@libs/ddd'
import { randomUUID } from 'crypto'

import { UserCreatedDomainEvent } from './events/user-created.domain-event'
import { CreateUserProps, UserProps } from './user.types'

export class UserEntity extends AggregateRoot<UserProps> {
    protected readonly _id: AggregateID

    constructor(props: CreateEntityProps<UserProps>) {
        super(props)
        this._id = props.id
    }

    static create(create: CreateUserProps): UserEntity {
        const id = randomUUID()

        const props: UserProps = { ...create }
        const user = new UserEntity({ id, props })

        user.addEvent(
            new UserCreatedDomainEvent({ aggregateId: id, name: props.name }),
        )

        return user
    }

    validate(): void {}
}
