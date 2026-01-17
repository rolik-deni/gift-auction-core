import { MongooseModuleOptions } from '@nestjs/mongoose'

export const mongooseModuleOptions = (): MongooseModuleOptions => {
    const uri = process.env.MONGO_URI
    if (!uri) {
        throw new Error('MONGO_URI is not set')
    }
    return { uri }
}
