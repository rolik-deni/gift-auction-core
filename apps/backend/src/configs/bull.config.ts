import type { BullRootModuleOptions } from '@nestjs/bullmq'

export const bullConnectionConfig: BullRootModuleOptions = {
    connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
    },
}
