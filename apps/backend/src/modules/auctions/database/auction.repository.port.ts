import { RepositoryPort } from '@libs/ddd'

import { AuctionEntity, AuctionStatus } from '../domain'

export type AuctionFindOneQuery = {
    id?: string
    status?: AuctionStatus
    currentRoundNumber?: number
}

export type AuctionFindManyQuery = {
    ids?: string[]
    statuses?: AuctionStatus[]
    currentRoundNumbers?: number[]
}

export type AuctionRepositoryPort = RepositoryPort<
    AuctionEntity,
    AuctionFindOneQuery
> & {
    findMany(query: AuctionFindManyQuery): Promise<AuctionEntity[]>
    extendRound(auctionId: string, newEndsAt: Date): Promise<string | null>
}
