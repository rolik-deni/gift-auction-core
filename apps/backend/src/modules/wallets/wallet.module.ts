import { Module, Provider } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

import { CreateWalletWhenUserIsCreatedDomainEventHandler } from './application'
import {
    CreateWalletHttpController,
    CreateWalletService,
    DepositFundsHttpController,
    DepositFundsService,
} from './commands'
import { WalletMongo, WalletRepository, WalletSchema } from './database'
import { WALLET_REPOSITORY } from './wallet.di-tokens'
import { WalletMapper } from './wallet.mapper'

const commandHandlers: Provider[] = [CreateWalletService, DepositFundsService]
const eventHandlers: Provider[] = [
    CreateWalletWhenUserIsCreatedDomainEventHandler,
]
const mappers: Provider[] = [WalletMapper]
const queryHandlers: Provider[] = []
const repositories: Provider[] = [
    { provide: WALLET_REPOSITORY, useClass: WalletRepository },
]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: WalletMongo.name, schema: WalletSchema },
        ]),
    ],
    controllers: [CreateWalletHttpController, DepositFundsHttpController],
    providers: [
        ...commandHandlers,
        ...eventHandlers,
        ...mappers,
        ...queryHandlers,
        ...repositories,
    ],
})
export class WalletModule {}
