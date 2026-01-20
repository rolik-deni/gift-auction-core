import { RedisService } from '@libs/infrastructure'
import { BullModule } from '@nestjs/bullmq'
import { Module, Provider } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

import {
    AUCTION_REPOSITORY,
    AUCTION_SCHEDULER_PORT,
    WALLET_PORT,
} from './auction.di-tokens'
import { AuctionMapper } from './auction.mapper'
import {
    CreateAuctionHttpController,
    CreateAuctionService,
    PlaceBidHttpController,
    PlaceBidService,
    StartAuctionHttpController,
    StartAuctionService,
} from './commands'
import { AuctionMongo, AuctionRepository, AuctionSchema } from './database'
import {
    AuctionProcessor,
    AuctionSchedulerAdapter,
    BiddingRepository,
    WalletAdapter,
} from './infrastructure'
import { GetAuctionHttpController, GetAuctionService } from './queries'

const commandHandlers: Provider[] = [
    CreateAuctionService,
    PlaceBidService,
    StartAuctionService,
]

const queryHandlers: Provider[] = [GetAuctionService]

const mappers: Provider[] = [AuctionMapper]

const repositories: Provider[] = [
    { provide: AUCTION_REPOSITORY, useClass: AuctionRepository },
    { provide: AUCTION_SCHEDULER_PORT, useClass: AuctionSchedulerAdapter },
    { provide: WALLET_PORT, useClass: WalletAdapter },
]

const httpControllers = [
    CreateAuctionHttpController,
    GetAuctionHttpController,
    PlaceBidHttpController,
    StartAuctionHttpController,
]

@Module({
    imports: [
        CqrsModule,
        BullModule.registerQueue({ name: 'auction' }),
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
        AuctionProcessor,
        BiddingRepository,
        RedisService,
    ],
})
export class AuctionModule {}
