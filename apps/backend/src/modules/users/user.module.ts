import { Module, Provider } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

import { CreateUserHttpController, CreateUserService } from './commands'
import { GetUserHttpController, GetUserService } from './queries'
import { UserMongo, UserRepository, UserSchema } from './database'
import { USER_REPOSITORY } from './user.di-tokens'
import { UserMapper } from './user.mapper'

const commandHandlers: Provider[] = [CreateUserService]
const mappers: Provider[] = [UserMapper]
const queryHandlers: Provider[] = [GetUserService]
const repositories: Provider[] = [
    { provide: USER_REPOSITORY, useClass: UserRepository },
]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: UserMongo.name, schema: UserSchema },
        ]),
    ],
    controllers: [CreateUserHttpController, GetUserHttpController],
    providers: [
        ...commandHandlers,
        ...mappers,
        ...queryHandlers,
        ...repositories,
    ],
    exports: [USER_REPOSITORY],
})
export class UserModule {}
