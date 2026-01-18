import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import z from 'zod'

export const walletSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    currency: z.string(),
    balanceAmount: z.string(),
    lockedAmount: z.string(),
})
export type WalletPersistence = z.TypeOf<typeof walletSchema>

@Schema({ collection: 'wallets' })
export class WalletMongo {
    @Prop({ type: String, required: true })
    _id: string

    @Prop({ type: Date, required: true })
    createdAt: Date

    @Prop({ type: Date, required: true })
    updatedAt: Date

    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: String, required: true })
    currency: string

    @Prop({ type: String, required: true })
    balanceAmount: string

    @Prop({ type: String, required: true })
    lockedAmount: string
}

export type WalletDocument = HydratedDocument<WalletMongo>
export const WalletSchema = SchemaFactory.createForClass(WalletMongo)
