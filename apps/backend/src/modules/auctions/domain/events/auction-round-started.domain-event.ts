import { DomainEvent, DomainEventProps } from '@libs/ddd'

export class AuctionRoundStartedEvent extends DomainEvent {
    readonly roundNumber: number

    constructor(props: DomainEventProps<AuctionRoundStartedEvent>) {
        super(props)
        this.roundNumber = props.roundNumber
    }
}
