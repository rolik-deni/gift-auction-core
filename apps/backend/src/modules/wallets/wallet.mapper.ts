import { Mapper, Money } from '@libs/ddd'
import { Injectable } from '@nestjs/common'

import { WalletPersistence, walletSchema } from './database'
import { WalletEntity } from './domain'
import { WalletResponseDto } from './dtos'

@Injectable()
export class WalletMapper implements Mapper<WalletEntity, WalletPersistence> {
    toPersistence(entity: WalletEntity): WalletPersistence {
        const props = entity.getProps()
        const record: WalletPersistence = {
            _id: props.id,
            userId: props.userId,
            balanceAmount: props.balance.amount.toFixed(),
            currency: props.balance.currency,
            lockedAmount: props.locked.amount.toFixed(),
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
                balance: Money.create(record.balanceAmount, record.currency),
                locked: Money.create(record.lockedAmount, record.currency),
            },
        })
        return entity
    }

    toResponse(entity: WalletEntity): WalletResponseDto {
        const props = entity.getProps()
        const response = new WalletResponseDto({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            userId: props.userId,
            balanceAmount: props.balance.amount.toFixed(),
            lockedAmount: props.locked.amount.toFixed(),
            currency: props.balance.currency,
        })
        return response
    }
}
