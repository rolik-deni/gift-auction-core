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

    /**
     * Добавляет элемент в отсортированное множество (ZSET) с указанным score.
     */
    async zadd(key: string, score: string, member: string): Promise<void> {
        await this._client.zadd(key, score, member)
    }

    /**
     * Возвращает score указанного элемента из отсортированного множества (ZSET).
     */
    async zscore(key: string, member: string): Promise<string | null> {
        return await this._client.zscore(key, member)
    }

    /**
     * Возвращает элементы ZSET в обратном порядке вместе с их score.
     */
    async zrevrangeWithScores(
        key: string,
        start: number,
        stop: number,
    ): Promise<string[]> {
        return await this._client.zrevrange(key, start, stop, 'WITHSCORES')
    }

    /**
     * Возвращает позицию элемента в ZSET при сортировке по убыванию.
     */
    async zrevrank(key: string, member: string): Promise<number | null> {
        return await this._client.zrevrank(key, member)
    }

    /**
     * Удаляет элементы из отсортированного множества (ZSET).
     */
    async zrem(key: string, members: string[]): Promise<void> {
        if (members.length === 0) {
            return
        }
        await this._client.zrem(key, ...members)
    }

    /**
     * Записывает набор полей в хеш (HASH).
     */
    async hset(key: string, data: Record<string, string>): Promise<void> {
        await this._client.hset(key, data)
    }

    /**
     * Читает значения указанных полей из хеша (HASH).
     */
    async hmget(key: string, fields: string[]): Promise<(string | null)[]> {
        return await this._client.hmget(key, ...fields)
    }

    /**
     * Удаляет указанные поля из хеша (HASH).
     */
    async hdel(key: string, fields: string[]): Promise<void> {
        if (fields.length === 0) {
            return
        }
        await this._client.hdel(key, ...fields)
    }
}
