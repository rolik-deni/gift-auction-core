import { ArgumentNotProvidedException } from '@libs/exceptions'
import { getLogContext } from '@libs/utils/log-context'
import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { UserEntity } from '../domain/user.entity'
import { UserMapper } from '../user.mapper'
import { UserFindOneQuery, UserRepositoryPort } from './user.repository.port'
import { UserDocument, UserMongo, userSchema } from './user.schema'

@Injectable()
export class UserRepository implements UserRepositoryPort {
    constructor(
        @InjectModel(UserMongo.name)
        private readonly _userModel: Model<UserDocument>,
        private readonly _eventEmitter: EventEmitter2,
        private readonly _mapper: UserMapper,
    ) {}

    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        UserRepository.name,
    )

    async save(entity: UserEntity | UserEntity[]): Promise<void> {
        const entities = Array.isArray(entity) ? entity : [entity]
        entities.forEach((item) => item.validate())

        const records = entities.map((item) => this._mapper.toPersistence(item))
        const updatedAt = new Date()
        records.forEach((record) => {
            record.updatedAt = updatedAt
        })

        this._logger.debug(
            `Saving ${entities.length} entities to "users" collection`,
            this._getLogContext(this.save.name),
        )

        if (records.length === 1) {
            await this._userModel
                .updateOne(
                    { _id: records[0]._id },
                    { $set: records[0] },
                    { upsert: true },
                )
                .exec()
        } else {
            await this._userModel.bulkWrite(
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
        query: UserFindOneQuery,
        throwError: true,
    ): Promise<UserEntity>
    async findOne(
        query: UserFindOneQuery,
        throwError?: false,
    ): Promise<UserEntity | undefined>
    async findOne(
        query: UserFindOneQuery,
        throwError?: boolean,
    ): Promise<UserEntity | undefined> {
        if (!query.id) {
            throw new ArgumentNotProvidedException('Query should contain id')
        }

        const record =
            (await this._userModel.findOne({ _id: query.id }).exec()) ??
            undefined

        if (!record && throwError) {
            throw new ArgumentNotProvidedException('User not found')
        }

        if (!record) {
            return record
        }

        const parsed = userSchema.parse(record.toObject())
        return this._mapper.toDomain(parsed)
    }
}
