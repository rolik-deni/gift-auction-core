import { ArgumentNotProvidedException } from '@libs/exceptions'
import { getLogContext } from '@libs/utils/log-context'
import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { AuctionMapper } from '../auction.mapper'
import { AuctionEntity } from '../domain'
import {
    AuctionFindOneQuery,
    AuctionRepositoryPort,
} from './auction.repository.port'
import { AuctionDocument, AuctionMongo } from './auction.schema'

@Injectable()
export class AuctionRepository implements AuctionRepositoryPort {
    constructor(
        @InjectModel(AuctionMongo.name)
        private readonly _auctionModel: Model<AuctionDocument>,
        private readonly _eventEmitter: EventEmitter2,
        private readonly _mapper: AuctionMapper,
    ) {}

    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        AuctionRepository.name,
    )

    async save(entity: AuctionEntity | AuctionEntity[]): Promise<void> {
        const entities = Array.isArray(entity) ? entity : [entity]
        entities.forEach((item) => item.validate())

        const records = entities.map((item) => this._mapper.toPersistence(item))
        const updatedAt = new Date()
        records.forEach((record) => {
            record.updatedAt = updatedAt
        })

        this._logger.debug(
            `Saving ${entities.length} entities to "auctions" collection`,
            this._getLogContext(this.save.name),
        )

        if (records.length === 1) {
            await this._auctionModel
                .updateOne(
                    { _id: records[0]._id },
                    { $set: records[0] },
                    { upsert: true },
                )
                .exec()
        } else {
            await this._auctionModel.bulkWrite(
                records.map((record) => ({
                    updateOne: {
                        filter: { _id: record._id },
                        update: { $set: record },
                        upsert: true,
                    },
                })),
            )
        }

        await Promise.all(
            entities.map((item) =>
                item.publishEvents(this._logger, this._eventEmitter),
            ),
        )
    }

    async findOne(
        query: AuctionFindOneQuery,
        throwError: true,
    ): Promise<AuctionEntity>
    async findOne(
        query: AuctionFindOneQuery,
        throwError?: false,
    ): Promise<AuctionEntity | undefined>
    async findOne(
        query: AuctionFindOneQuery,
        throwError?: boolean,
    ): Promise<AuctionEntity | undefined> {
        if (!query.id && !query.status) {
            throw new ArgumentNotProvidedException(
                'Query should contain id or status',
            )
        }

        const record =
            (await this._auctionModel
                .findOne({
                    ...(query.id && { _id: query.id }),
                    ...(query.status && { status: query.status }),
                })
                .exec()) ?? undefined

        if (!record && throwError) {
            throw new ArgumentNotProvidedException('Auction not found')
        }

        return record ? this._mapper.toDomain(record.toObject()) : record
    }
}
