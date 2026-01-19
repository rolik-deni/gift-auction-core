import { DomainEvent, DomainEventProps } from '@libs/ddd'

export class AuctionCompletedEvent extends DomainEvent {
    constructor(props: DomainEventProps<AuctionCompletedEvent>) {
        super(props)
    }
}
