import { Money } from '@libs/ddd'

export enum AuctionStatus {
    CREATED = 'CREATED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
}

export interface CreateAuctionProps {
    title: string
    totalItems: number
    roundsTotal: number
    roundDurationSeconds: number
    entryPrice: Money
}

export interface AuctionProps extends CreateAuctionProps {
    status: AuctionStatus
    itemsPerRound: number
    currentRoundNumber: number
    currentRoundEndsAt: Date | null
}
