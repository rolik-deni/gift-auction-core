import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { RequestContextModule } from 'nestjs-request-context'

import { mongooseModuleOptions } from './configs'
import { ContextInterceptor, ExceptionInterceptor } from './libs/application'
import { AuctionModule } from './modules/auctions/auction.module'
import { UserModule } from './modules/users/user.module'
import { WalletModule } from './modules/wallets/wallet.module'
@Module({
    imports: [
        AuctionModule,
        EventEmitterModule.forRoot(),
        MongooseModule.forRootAsync({ useFactory: mongooseModuleOptions }),
        RequestContextModule,
        UserModule,
        WalletModule,
    ],
    controllers: [],
    providers: [
        { provide: APP_INTERCEPTOR, useClass: ContextInterceptor },
        { provide: APP_INTERCEPTOR, useClass: ExceptionInterceptor },
    ],
})
export class AppModule {}
