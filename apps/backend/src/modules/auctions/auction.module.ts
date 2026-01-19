import { RedisService } from '@libs/infrastructure'
import { Module, Provider } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

import { AUCTION_REPOSITORY, PAYMENT_PORT } from './auction.di-tokens'
import { AuctionMapper } from './auction.mapper'
import {
    CreateAuctionHttpController,
    CreateAuctionService,
    PlaceBidHttpController,
    PlaceBidService,
} from './commands'
import { AuctionMongo, AuctionRepository, AuctionSchema } from './database'
import { BiddingRepository, PaymentAdapter } from './infrastructure'
import { GetAuctionHttpController, GetAuctionService } from './queries'

const commandHandlers: Provider[] = [CreateAuctionService, PlaceBidService]

const queryHandlers: Provider[] = [GetAuctionService]

const mappers: Provider[] = [AuctionMapper]

const repositories: Provider[] = [
    { provide: AUCTION_REPOSITORY, useClass: AuctionRepository },
    { provide: PAYMENT_PORT, useClass: PaymentAdapter },
]

const httpControllers = [
    CreateAuctionHttpController,
    GetAuctionHttpController,
    PlaceBidHttpController,
]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: AuctionMongo.name, schema: AuctionSchema },
        ]),
    ],
    controllers: [...httpControllers],
    providers: [
        ...commandHandlers,
        ...mappers,
        ...queryHandlers,
        ...repositories,
        BiddingRepository,
        RedisService,
    ],
})
export class AuctionModule {}
