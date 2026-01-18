import { RepositoryPort } from '@libs/ddd'

import { WalletEntity } from '../domain/wallet.entity'

export type WalletFindOneQuery = {
    id?: string
    userId?: string
}

export type WalletRepositoryPort = RepositoryPort<
    WalletEntity,
    WalletFindOneQuery
>
