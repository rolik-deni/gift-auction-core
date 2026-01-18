import { Module, Provider } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

import { CreateWalletWhenUserIsCreatedDomainEventHandler } from './application'
import {
    ChargeLockedHttpController,
    ChargeLockedService,
    CreateWalletHttpController,
    CreateWalletService,
    DepositFundsHttpController,
    DepositFundsService,
    LockFundsHttpController,
    LockFundsService,
    UnlockFundsHttpController,
    UnlockFundsService,
} from './commands'
import { WalletMongo, WalletRepository, WalletSchema } from './database'
import { GetWalletHttpController, GetWalletService } from './queries'
import { WALLET_REPOSITORY } from './wallet.di-tokens'
import { WalletMapper } from './wallet.mapper'

const commandHandlers: Provider[] = [
    ChargeLockedService,
    CreateWalletService,
    DepositFundsService,
    LockFundsService,
    UnlockFundsService,
]

const queryHandlers: Provider[] = [GetWalletService]

const eventHandlers: Provider[] = [
    CreateWalletWhenUserIsCreatedDomainEventHandler,
]

const mappers: Provider[] = [WalletMapper]

const repositories: Provider[] = [
    { provide: WALLET_REPOSITORY, useClass: WalletRepository },
]

const httpControllers = [
    ChargeLockedHttpController,
    CreateWalletHttpController,
    DepositFundsHttpController,
    GetWalletHttpController,
    LockFundsHttpController,
    UnlockFundsHttpController,
]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: WalletMongo.name, schema: WalletSchema },
        ]),
    ],
    controllers: [...httpControllers],
    providers: [
        ...commandHandlers,
        ...eventHandlers,
        ...mappers,
        ...queryHandlers,
        ...repositories,
    ],
})
export class WalletModule {}
