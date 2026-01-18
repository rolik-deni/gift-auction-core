import { Mapper } from '@libs/ddd'
import { Injectable } from '@nestjs/common'

import { UserPersistence, userSchema } from './database'
import { UserEntity } from './domain/user.entity'

@Injectable()
export class UserMapper implements Mapper<UserEntity, UserPersistence> {
    toPersistence(entity: UserEntity): UserPersistence {
        const props = entity.getProps()
        const record: UserPersistence = {
            _id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            name: props.name,
        }
        return userSchema.parse(record)
    }

    toDomain(record: UserPersistence): UserEntity {
        userSchema.parse(record)

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
