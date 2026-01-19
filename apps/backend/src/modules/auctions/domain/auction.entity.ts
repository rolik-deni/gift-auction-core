import { AggregateID, AggregateRoot, CreateEntityProps } from '@libs/ddd'
import {
    ArgumentInvalidException,
    ArgumentOutOfRangeException,
} from '@libs/exceptions'
import { randomUUID } from 'crypto'

import {
    AuctionProps,
    AuctionStatus,
    CreateAuctionProps,
} from './auction.types'
import {
    AuctionCompletedEvent,
    AuctionRoundStartedEvent,
    AuctionStartedEvent,
} from './events'

export class AuctionEntity extends AggregateRoot<AuctionProps> {
    protected readonly _id: AggregateID

    constructor(props: CreateEntityProps<AuctionProps>) {
        super(props)
        this._id = props.id
    }

    static create(props: CreateAuctionProps): AuctionEntity {
        if (props.roundsTotal <= 0) {
            throw new ArgumentOutOfRangeException(
                'Rounds total must be greater than 0',
            )
        }
        if (props.totalItems % props.roundsTotal !== 0) {
            throw new ArgumentInvalidException(
                'Total items must be divisible by rounds total',
            )
        }

        const id = randomUUID()
        const itemsPerRound = props.totalItems / props.roundsTotal

        const auction = new AuctionEntity({
            id,
            props: {
                ...props,
                status: AuctionStatus.CREATED,
                itemsPerRound,
                currentRoundNumber: 0,
                currentRoundEndsAt: null,
            },
        })

        return auction
    }

    start(): void {
        if (this.props.status !== AuctionStatus.CREATED) {
            throw new ArgumentInvalidException(
                'Auction can be started only from CREATED status',
            )
        }

        this.props.status = AuctionStatus.ACTIVE
        this.props.currentRoundNumber = 1
        this.props.currentRoundEndsAt = new Date(
            Date.now() + this.props.roundDurationSeconds * 1000,
        )

        this.addEvent(new AuctionStartedEvent({ aggregateId: this.id }))
    }

    nextRound(): void {
        if (this.props.status !== AuctionStatus.ACTIVE) {
            throw new ArgumentInvalidException(
                'Auction can move to next round only from ACTIVE status',
            )
        }

        if (this.props.currentRoundNumber < this.props.roundsTotal) {
            this.props.currentRoundNumber += 1
            this.props.currentRoundEndsAt = new Date(
                Date.now() + this.props.roundDurationSeconds * 1000,
            )

            this.addEvent(
                new AuctionRoundStartedEvent({
                    aggregateId: this.id,
                    roundNumber: this.props.currentRoundNumber,
                }),
            )
            return
        }

        if (this.props.currentRoundNumber === this.props.roundsTotal) {
            this._finish()
        }
    }

    extendRound(seconds: number): void {
        if (!this.props.currentRoundEndsAt) {
            throw new ArgumentInvalidException('Current round is not active')
        }
        if (seconds <= 0) {
            throw new ArgumentOutOfRangeException(
                'Extension seconds must be greater than 0',
            )
        }

        const minEndTime = Date.now() + seconds * 1000
        if (this.props.currentRoundEndsAt.getTime() < minEndTime) {
            this.props.currentRoundEndsAt = new Date(minEndTime)
        }
    }

    validate(): void {
        if (!this.props.title) {
            throw new ArgumentInvalidException('Title is required')
        }
        if (this.props.roundsTotal <= 0) {
            throw new ArgumentOutOfRangeException(
                'Rounds total must be greater than 0',
            )
        }
        if (this.props.totalItems % this.props.roundsTotal !== 0) {
            throw new ArgumentInvalidException(
                'Total items must be divisible by rounds total',
            )
        }
    }

    private _finish(): void {
        this.props.status = AuctionStatus.COMPLETED
        this.props.currentRoundEndsAt = null
        this.addEvent(new AuctionCompletedEvent({ aggregateId: this.id }))
    }
}
