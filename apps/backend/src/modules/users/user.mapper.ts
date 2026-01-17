import { Mapper } from '@libs/ddd'
import { Injectable } from '@nestjs/common'

import { UserPersistence, userSchema } from './database/user.repository'
import { UserEntity } from './domain/user.entity'

@Injectable()
export class UserMapper implements Mapper<UserEntity, UserPersistence> {
    toPersistence(entity: UserEntity): UserPersistence {
        const copy = entity.getProps()
        const record: UserPersistence = {
            _id: copy.id,
            createdAt: copy.createdAt,
            updatedAt: copy.updatedAt,
            name: copy.name,
        }
        return userSchema.parse(record)
    }

    toDomain(record: UserPersistence): UserEntity {
        const entity = new UserEntity({
            id: record._id,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            props: {
                name: record.name,
            },
        })
        return entity
    }
}
