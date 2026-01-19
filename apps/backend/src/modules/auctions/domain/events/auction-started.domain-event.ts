import { DomainEvent, DomainEventProps } from '@libs/ddd'

export class AuctionStartedEvent extends DomainEvent {
    constructor(props: DomainEventProps<AuctionStartedEvent>) {
        super(props)
    }
}
