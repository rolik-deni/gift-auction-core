import {
    ArgumentNotProvidedException,
    ConflictException,
} from '@libs/exceptions'
import { getLogContext } from '@libs/utils/log-context'
import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { z } from 'zod'

import { WalletEntity } from '../domain/wallet.entity'
import { WalletMapper } from '../wallet.mapper'
import {
    WalletFindOneQuery,
    WalletRepositoryPort,
} from './wallet.repository.port'
import { WalletDocument, WalletMongo } from './wallet.schema'

export const walletSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    balanceAmount: z.string(),
    balanceCurrency: z.string(),
    lockedAmount: z.string(),
    lockedCurrency: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type WalletPersistence = z.TypeOf<typeof walletSchema>

const isDuplicateKeyError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
        return false
    }
    return (error as { code?: number }).code === 11000
}

@Injectable()
export class WalletRepository implements WalletRepositoryPort {
    constructor(
        @InjectModel(WalletMongo.name)
        private readonly _walletModel: Model<WalletDocument>,
        private readonly _eventEmitter: EventEmitter2,
        private readonly _mapper: WalletMapper,
    ) {}

    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        WalletRepository.name,
    )

    async create(entity: WalletEntity | WalletEntity[]): Promise<void> {
        const entities = Array.isArray(entity) ? entity : [entity]
        entities.forEach((item) => item.validate())

        const records = entities.map((item) => this._mapper.toPersistence(item))

        this._logger.debug(
            `Writing ${entities.length} entities to "wallets" collection`,
            this._getLogContext(this.create.name),
        )

        try {
            if (records.length === 1) {
                await this._walletModel.create(records[0])
            } else {
                await this._walletModel.insertMany(records)
            }
        } catch (error) {
            if (isDuplicateKeyError(error)) {
                throw new ConflictException('Wallet already exists')
            }
            throw error
        }

        await Promise.all(
            entities.map((item) =>
                item.publishEvents(this._logger, this._eventEmitter),
            ),
        )
    }

    async save(entity: WalletEntity): Promise<void> {
        const record = this._mapper.toPersistence(entity)
        record.updatedAt = new Date()

        await this._walletModel
            .updateOne({ _id: record._id }, { $set: record })
            .exec()
    }

    async findOne(
        query: WalletFindOneQuery,
        throwError: true,
    ): Promise<WalletEntity>
    async findOne(
        query: WalletFindOneQuery,
        throwError?: false,
    ): Promise<WalletEntity | undefined>
    async findOne(
        query: WalletFindOneQuery,
        throwError?: boolean,
    ): Promise<WalletEntity | undefined> {
        if (!query.id && !query.userId) {
            throw new ArgumentNotProvidedException(
                'Query should contain id or userId',
            )
        }

        const record =
            (await this._walletModel
                .findOne({
                    ...(query.id && { _id: query.id }),
                    ...(query.userId && { userId: query.userId }),
                })
                .exec()) ?? undefined

        if (!record && throwError) {
            throw new ArgumentNotProvidedException('Wallet not found')
        }

        return record ? this._mapper.toDomain(record) : record
    }
}
