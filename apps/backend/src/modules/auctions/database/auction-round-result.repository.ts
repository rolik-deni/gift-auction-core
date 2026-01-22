import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import {
    AuctionRoundResultDocument,
    AuctionRoundResultMongo,
    auctionRoundResultSchema,
} from './auction-round-result.schema'

export type AuctionRoundWinner = {
    rank: number
    userId: string
    bidAmount: string
    bidPlacedAt: Date
}

@Injectable()
export class AuctionRoundResultRepository {
    constructor(
        @InjectModel(AuctionRoundResultMongo.name)
        private readonly _model: Model<AuctionRoundResultDocument>,
    ) {}

    async saveRoundResult(
        auctionId: string,
        roundNumber: number,
        winners: AuctionRoundWinner[],
    ): Promise<boolean> {
        const record = auctionRoundResultSchema.parse({
            auctionId,
            roundNumber,
            winners,
            createdAt: new Date(),
        })

        const result = await this._model.updateOne(
            { auctionId, roundNumber },
            { $setOnInsert: record },
            { upsert: true },
        )

        return result.upsertedCount > 0
    }

    async findByAuctionId(auctionId: string): Promise<AuctionRoundWinner[]> {
        const results = await this._model
            .find({ auctionId })
            .sort({ roundNumber: 1 })
            .lean()
            .exec()

        return results.flatMap((item) => item.winners ?? [])
    }

    async findRoundResults(auctionId: string): Promise<
        {
            roundNumber: number
            winners: AuctionRoundWinner[]
        }[]
    > {
        const results = await this._model
            .find({ auctionId })
            .sort({ roundNumber: 1 })
            .lean()
            .exec()

        return results.map((item) => ({
            roundNumber: item.roundNumber,
            winners: item.winners ?? [],
        }))
    }
}
