import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ collection: 'wallets' })
export class WalletMongo {
    @Prop({ type: String, required: true })
    _id: string

    @Prop({ type: String, required: true })
    userId: string

    @Prop({ type: String, required: true })
    balanceAmount: string

    @Prop({ type: String, required: true })
    balanceCurrency: string

    @Prop({ type: String, required: true })
    lockedAmount: string

    @Prop({ type: String, required: true })
    lockedCurrency: string

    @Prop({ type: Date, required: true })
    createdAt: Date

    @Prop({ type: Date, required: true })
    updatedAt: Date
}

export type WalletDocument = HydratedDocument<WalletMongo>

export const WalletSchema = SchemaFactory.createForClass(WalletMongo)
