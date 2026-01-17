import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { MongooseModule } from '@nestjs/mongoose'
import { RequestContextModule } from 'nestjs-request-context'

import { mongooseModuleOptions } from './configs/mongoose.config'
import { ContextInterceptor } from './libs/application/context'
import { AppController } from './modules/app/app.controller'
import { AppService } from './modules/app/app.service'
import { UserModule } from './modules/users/user.module'
import { WalletModule } from './modules/wallets/wallet.module'
@Module({
    imports: [
        EventEmitterModule.forRoot(),
        MongooseModule.forRootAsync({ useFactory: mongooseModuleOptions }),
        RequestContextModule,
        UserModule,
        WalletModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ContextInterceptor,
        },
        AppService,
    ],
})
export class AppModule {}
