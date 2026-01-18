import { Mapper } from '@libs/ddd'
import { Injectable } from '@nestjs/common'

import { WalletPersistence, walletSchema } from './database/wallet.repository'
import { Money } from './domain/value-objects/money.vo'
import { WalletEntity } from './domain/wallet.entity'

@Injectable()
export class WalletMapper implements Mapper<WalletEntity, WalletPersistence> {
    toPersistence(entity: WalletEntity): WalletPersistence {
        const props = entity.getProps()
        const record: WalletPersistence = {
            _id: props.id,
            userId: props.userId,
            balanceAmount: props.balance.amount.toFixed(),
            balanceCurrency: props.balance.currency,
            lockedAmount: props.locked.amount.toFixed(),
            lockedCurrency: props.locked.currency,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        }
        return walletSchema.parse(record)
    }

    toDomain(record: WalletPersistence): WalletEntity {
        walletSchema.parse(record)
        const entity = new WalletEntity({
            id: record._id,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            props: {
                userId: record.userId,
                balance: Money.create(
                    record.balanceAmount,
                    record.balanceCurrency,
                ),
                locked: Money.create(
                    record.lockedAmount,
                    record.lockedCurrency,
                ),
            },
        })
        return entity
    }
}
