import { RepositoryPort } from '@libs/ddd'

import { AuctionEntity, AuctionStatus } from '../domain'

export type AuctionFindOneQuery = {
    id?: string
    status?: AuctionStatus
    currentRoundNumber?: number
}

export type AuctionRepositoryPort = RepositoryPort<
    AuctionEntity,
    AuctionFindOneQuery
> & {
    extendRound(auctionId: string, newEndsAt: Date): Promise<string | null>
}
