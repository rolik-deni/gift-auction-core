import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ collection: 'users' })
export class UserMongo {
    @Prop({ type: String, required: true })
    _id: string

    @Prop({ type: Date, required: true })
    createdAt: Date

    @Prop({ type: Date, required: true })
    updatedAt: Date

    @Prop({ type: String, required: true })
    name: string
}

export type UserDocument = HydratedDocument<UserMongo>

export const UserSchema = SchemaFactory.createForClass(UserMongo)
