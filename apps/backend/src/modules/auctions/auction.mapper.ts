import { Mapper, Money } from '@libs/ddd'
import { Injectable } from '@nestjs/common'

import { AuctionPersistence, auctionSchema } from './database/auction.schema'
import { AuctionEntity } from './domain'
import { AuctionResponseDto } from './dtos'

@Injectable()
export class AuctionMapper implements Mapper<
    AuctionEntity,
    AuctionPersistence
> {
    toPersistence(entity: AuctionEntity): AuctionPersistence {
        const props = entity.getProps()
        const record: AuctionPersistence = {
            _id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            title: props.title,
            status: props.status,
            totalItems: props.totalItems,
            itemsPerRound: props.itemsPerRound,
            roundsTotal: props.roundsTotal,
            roundDurationSeconds: props.roundDurationSeconds,
            currentRoundNumber: props.currentRoundNumber,
            currentRoundEndsAt: props.currentRoundEndsAt,
            entryPrice: {
                amount: props.entryPrice.amount.toFixed(),
                currency: props.entryPrice.currency,
            },
        }
        return auctionSchema.parse(record)
    }

    toDomain(record: AuctionPersistence): AuctionEntity {
        auctionSchema.parse(record)
        return new AuctionEntity({
            id: record._id,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            props: {
                title: record.title,
                status: record.status,
                totalItems: record.totalItems,
                itemsPerRound: record.itemsPerRound,
                roundsTotal: record.roundsTotal,
                roundDurationSeconds: record.roundDurationSeconds,
                currentRoundNumber: record.currentRoundNumber,
                currentRoundEndsAt: record.currentRoundEndsAt,
                entryPrice: Money.create(
                    record.entryPrice.amount,
                    record.entryPrice.currency,
                ),
            },
        })
    }

    toResponse(entity: AuctionEntity): AuctionResponseDto {
        const props = entity.getProps()
        return new AuctionResponseDto({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            title: props.title,
            status: props.status,
            totalItems: props.totalItems,
            itemsPerRound: props.itemsPerRound,
            roundsTotal: props.roundsTotal,
            roundDurationSeconds: props.roundDurationSeconds,
            currentRoundNumber: props.currentRoundNumber,
            currentRoundEndsAt: props.currentRoundEndsAt,
            entryPriceAmount: props.entryPrice.amount.toFixed(),
            entryPriceCurrency: props.entryPrice.currency,
        })
    }
}
