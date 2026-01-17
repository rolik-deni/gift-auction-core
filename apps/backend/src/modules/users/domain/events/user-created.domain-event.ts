import { DomainEvent, DomainEventProps } from '@libs/ddd'

export class UserCreatedDomainEvent extends DomainEvent {
    readonly name: string

    constructor(props: DomainEventProps<UserCreatedDomainEvent>) {
        super(props)
        this.name = props.name
    }
}
