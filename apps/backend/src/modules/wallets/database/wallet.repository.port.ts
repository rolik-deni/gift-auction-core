import { RepositoryPort } from '@libs/ddd'

import { WalletEntity } from '../domain/wallet.entity'

export type WalletFindOneQuery = {
    id?: string
    userId?: string
}

export interface WalletRepositoryPort extends RepositoryPort<WalletEntity> {
    findOne(query: WalletFindOneQuery, throwError: true): Promise<WalletEntity>
    findOne(
        query: WalletFindOneQuery,
        throwError?: false,
    ): Promise<WalletEntity | undefined>
    findOne(
        query: WalletFindOneQuery,
        throwError?: boolean,
    ): Promise<WalletEntity | undefined>
    save(entity: WalletEntity): Promise<void>
}
