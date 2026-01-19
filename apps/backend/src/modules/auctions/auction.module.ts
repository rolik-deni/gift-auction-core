import { Module, Provider } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { MongooseModule } from '@nestjs/mongoose'

import { AUCTION_REPOSITORY } from './auction.di-tokens'
import { AuctionMapper } from './auction.mapper'
import { CreateAuctionHttpController, CreateAuctionService } from './commands'
import { AuctionMongo, AuctionRepository, AuctionSchema } from './database'
import { GetAuctionHttpController, GetAuctionService } from './queries'

const commandHandlers: Provider[] = [CreateAuctionService]

const queryHandlers: Provider[] = [GetAuctionService]

const mappers: Provider[] = [AuctionMapper]

const repositories: Provider[] = [
    { provide: AUCTION_REPOSITORY, useClass: AuctionRepository },
]

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: AuctionMongo.name, schema: AuctionSchema },
        ]),
    ],
    controllers: [CreateAuctionHttpController, GetAuctionHttpController],
    providers: [
        ...commandHandlers,
        ...mappers,
        ...queryHandlers,
        ...repositories,
    ],
})
export class AuctionModule {}
