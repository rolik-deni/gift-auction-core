import { getLogContext } from '@libs/utils/log-context'
import { Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { UserEntity } from '../domain/user.entity'
import { UserMapper } from '../user.mapper'
import { UserRepositoryPort } from './user.repository.port'
import { UserDocument, UserMongo } from './user.schema'

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

    async create(entity: UserEntity | UserEntity[]): Promise<void> {
        const entities = Array.isArray(entity) ? entity : [entity]
        entities.forEach((item) => item.validate())

        const records = entities.map((item) => this._mapper.toPersistence(item))

        this._logger.debug(
            `Writing ${entities.length} entities to "users" collection`,
            this._getLogContext(this.create.name),
        )

        if (records.length === 1) {
            await this._userModel.create(records[0])
        } else {
            await this._userModel.insertMany(records)
        }

        await Promise.all(
            entities.map((item) =>
                item.publishEvents(this._logger, this._eventEmitter),
            ),
        )
    }
}
