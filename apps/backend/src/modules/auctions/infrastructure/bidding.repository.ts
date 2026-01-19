import { RedisService } from '@libs/infrastructure'
import { Injectable } from '@nestjs/common'

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

    private _key(auctionId: string): string {
        return `auction:${auctionId}:bids`
    }
}
