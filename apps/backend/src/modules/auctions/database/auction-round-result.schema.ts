import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import z from 'zod'

export const auctionRoundWinnerSchema = z.object({
    rank: z.number(),
    userId: z.string(),
    bidAmount: z.string(),
    bidPlacedAt: z.date(),
})

export const auctionRoundResultSchema = z.object({
    auctionId: z.string(),
    roundNumber: z.number(),
    winners: z.array(auctionRoundWinnerSchema),
    createdAt: z.date(),
})

export type AuctionRoundResultPersistence = z.TypeOf<
    typeof auctionRoundResultSchema
>

@Schema({ collection: 'auction_round_results' })
export class AuctionRoundResultMongo {
    @Prop({ type: String, required: true, index: true })
    auctionId: string

    @Prop({ type: Number, required: true, index: true })
    roundNumber: number

    @Prop({
        type: [
            {
                rank: Number,
                userId: String,
                bidAmount: String,
                bidPlacedAt: Date,
            },
        ],
        required: true,
    })
    winners: {
        rank: number
        userId: string
        bidAmount: string
        bidPlacedAt: Date
    }[]

    @Prop({ type: Date, required: true })
    createdAt: Date
}

export type AuctionRoundResultDocument =
    HydratedDocument<AuctionRoundResultMongo>

export const AuctionRoundResultSchema = SchemaFactory.createForClass(
    AuctionRoundResultMongo,
)

AuctionRoundResultSchema.index(
    { auctionId: 1, roundNumber: 1 },
    { unique: true },
)
