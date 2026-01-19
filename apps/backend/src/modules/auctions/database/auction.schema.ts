import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import z from 'zod'

import { AuctionStatus } from '../domain'

export const auctionSchema = z.object({
    _id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    title: z.string(),
    status: z.enum(AuctionStatus),
    totalItems: z.number(),
    itemsPerRound: z.number(),
    roundsTotal: z.number(),
    roundDurationSeconds: z.number(),
    currentRoundNumber: z.number(),
    currentRoundEndsAt: z.date().nullable(),
    entryPrice: z.object({
        amount: z.string(),
        currency: z.string(),
    }),
})

export type AuctionPersistence = z.TypeOf<typeof auctionSchema>

@Schema({ collection: 'auctions' })
export class AuctionMongo {
    @Prop({ type: String, required: true })
    _id: string

    @Prop({ type: Date, required: true })
    createdAt: Date

    @Prop({ type: Date, required: true })
    updatedAt: Date

    @Prop({ type: String, required: true })
    title: string

    @Prop({ type: String, required: true, enum: AuctionStatus, index: true })
    status: AuctionStatus

    @Prop({ type: Number, required: true })
    totalItems: number

    @Prop({ type: Number, required: true })
    itemsPerRound: number

    @Prop({ type: Number, required: true })
    roundsTotal: number

    @Prop({ type: Number, required: true })
    roundDurationSeconds: number

    @Prop({ type: Number, required: true })
    currentRoundNumber: number

    @Prop({ type: Date, required: true, index: true })
    currentRoundEndsAt: Date | null

    @Prop({
        type: { amount: String, currency: String },
        required: true,
    })
    entryPrice: {
        amount: string
        currency: string
    }
}

export type AuctionDocument = HydratedDocument<AuctionMongo>

export const AuctionSchema = SchemaFactory.createForClass(AuctionMongo)
