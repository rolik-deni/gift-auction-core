import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly _client: Redis

    constructor() {
        const host = process.env.REDIS_HOST ?? 'localhost'
        const port = Number(process.env.REDIS_PORT ?? 6379)
        this._client = new Redis({ host, port })
    }

    async onModuleDestroy(): Promise<void> {
        await this._client.quit()
    }

    async zadd(key: string, score: string, member: string): Promise<void> {
        await this._client.zadd(key, score, member)
    }

    async zscore(key: string, member: string): Promise<string | null> {
        return await this._client.zscore(key, member)
    }
}
