import { RepositoryPort } from '@libs/ddd'

import { AuctionEntity, AuctionStatus } from '../domain'

export type AuctionFindOneQuery = {
    id?: string
    status?: AuctionStatus
}

export type AuctionRepositoryPort = RepositoryPort<
    AuctionEntity,
    AuctionFindOneQuery
>
