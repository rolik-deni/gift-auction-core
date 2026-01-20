import { RedisService } from '@libs/infrastructure'
import { Injectable } from '@nestjs/common'

import { IBidder } from './bidder.interface'

@Injectable()
export class BiddingRepository {
    constructor(private readonly _redis: RedisService) {}

    async saveBid(
        auctionId: string,
        userId: string,
        amount: string,
    ): Promise<void> {
        await this._redis.zadd(this._key(auctionId), amount, userId)
    }

    async getUserBid(
        auctionId: string,
        userId: string,
    ): Promise<string | null> {
        return await this._redis.zscore(this._key(auctionId), userId)
    }

    async getTopBidders(auctionId: string, limit: number): Promise<IBidder[]> {
        const raw = await this._redis.zrevrangeWithScores(
            this._key(auctionId),
            0,
            Math.max(limit - 1, 0),
        )
        return this._parseWithScores(raw)
    }

    async getBiddersChunk(
        auctionId: string,
        offset: number,
        limit: number,
        excludeUserIds?: string[],
    ): Promise<IBidder[]> {
        const raw = await this._redis.zrevrangeWithScores(
            this._key(auctionId),
            offset,
            offset + limit - 1,
        )
        const parsed = this._parseWithScores(raw)
        if (!excludeUserIds?.length) {
            return parsed
        }
        const excluded = new Set(excludeUserIds)
        return parsed.filter((bidder) => !excluded.has(bidder.userId))
    }

    private _key(auctionId: string): string {
        return `auction:${auctionId}:bids`
    }

    private _parseWithScores(raw: string[]): IBidder[] {
        const result: IBidder[] = []
        for (let i = 0; i < raw.length; i += 2) {
            const userId = raw[i]
            const amount = raw[i + 1]
            if (userId && amount) {
                result.push({ userId, amount })
            }
        }
        return result
    }
}
