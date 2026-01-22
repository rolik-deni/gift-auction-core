import { RedisService } from '@libs/infrastructure'
import { Injectable } from '@nestjs/common'
import { BigNumber } from 'bignumber.js'

import { IBidder } from './bidder.interface'

@Injectable()
export class BiddingRepository {
    constructor(private readonly _redis: RedisService) {}

    private static readonly _scoreScale = new BigNumber('1000000')
    private static readonly _timeScale = new BigNumber('10000000000000')
    private static readonly _metaFields = ['amount', 'placedAt'] as const

    /**
     * Сохраняет ставку пользователя и метаданные (сумма и время) в Redis.
     */
    async saveBid(
        auctionId: string,
        userId: string,
        amount: string,
        placedAt: Date,
    ): Promise<void> {
        const key = this._bidsKey(auctionId)
        const metaKey = this._bidMetaKey(auctionId, userId)

        const score = this._buildScore(amount, placedAt)
        await this._redis.zadd(key, score, userId)

        await this._redis.hset(metaKey, {
            amount,
            placedAt: String(placedAt.getTime()),
        })
    }

    /**
     * Возвращает ставку пользователя для указанного аукциона.
     */
    async getUserBid(
        auctionId: string,
        userId: string,
    ): Promise<IBidder | null> {
        return await this._getBidMeta(auctionId, userId)
    }

    /**
     * Возвращает топ участников по ставкам (в порядке убывания).
     */
    async getTopBidders(auctionId: string, limit: number): Promise<IBidder[]> {
        if (limit <= 0) {
            return []
        }
        return await this._getBiddersRange(auctionId, 0, limit - 1)
    }

    /**
     * Возвращает порцию участников по ставкам с учётом смещения и исключений.
     */
    async getBiddersChunk(
        auctionId: string,
        offset: number,
        limit: number,
        excludeUserIds?: string[],
    ): Promise<IBidder[]> {
        if (limit <= 0) {
            return []
        }

        const from = Math.max(offset, 0)
        const to = from + limit - 1

        const bidders = await this._getBiddersRange(auctionId, from, to)

        if (!excludeUserIds?.length) {
            return bidders
        }

        const excluded = new Set(excludeUserIds)
        return bidders.filter((b) => !excluded.has(b.userId))
    }

    /**
     * Удаляет указанных участников из рейтинга и их метаданные.
     */
    async removeBidders(auctionId: string, userIds: string[]): Promise<void> {
        if (userIds.length === 0) {
            return
        }

        const key = this._bidsKey(auctionId)
        await this._redis.zrem(key, userIds)

        await Promise.all(
            userIds.map((userId) =>
                this._redis.hdel(this._bidMetaKey(auctionId, userId), [
                    ...BiddingRepository._metaFields,
                ]),
            ),
        )
    }

    /**
     * Возвращает позицию пользователя в рейтинге (0 — лучший).
     */
    async getUserRank(
        auctionId: string,
        userId: string,
    ): Promise<number | null> {
        return await this._redis.zrevrank(this._bidsKey(auctionId), userId)
    }

    /**
     * Формирует ключ ZSET со ставками по аукциону.
     */
    private _bidsKey(auctionId: string): string {
        return `auction:${auctionId}:bids`
    }

    /**
     * Формирует ключ HASH с метаданными ставки пользователя.
     */
    private _bidMetaKey(auctionId: string, userId: string): string {
        return `auction:${auctionId}:bid:${userId}`
    }

    /**
     * Собирает score для ZSET на основе суммы и времени (для tie-break).
     */
    private _buildScore(amount: string, placedAt: Date): string {
        const amountScaled = new BigNumber(amount).times(
            BiddingRepository._scoreScale,
        )

        const tieBreaker = BiddingRepository._timeScale
            .minus(placedAt.getTime())
            .div(BiddingRepository._timeScale)

        return amountScaled.plus(tieBreaker).toFixed()
    }

    /**
     * Декодирует сумму из score (целая часть до scale).
     */
    private _decodeAmount(score: string): string {
        return new BigNumber(score)
            .integerValue(BigNumber.ROUND_FLOOR)
            .div(BiddingRepository._scoreScale)
            .toFixed()
    }

    /**
     * Получает участников из диапазона ZSET и подтягивает метаданные ставок.
     */
    private async _getBiddersRange(
        auctionId: string,
        start: number,
        stop: number,
    ): Promise<IBidder[]> {
        const raw = await this._redis.zrevrangeWithScores(
            this._bidsKey(auctionId),
            start,
            stop,
        )

        const parsed = this._parseWithScores(raw)

        const bidders = await Promise.all(
            parsed.map(
                async (b) => (await this._getBidMeta(auctionId, b.userId)) ?? b,
            ),
        )

        return bidders
    }

    /**
     * Получает метаданные ставки из HASH или восстанавливает сумму из score.
     */
    private async _getBidMeta(
        auctionId: string,
        userId: string,
    ): Promise<IBidder | null> {
        const metaKey = this._bidMetaKey(auctionId, userId)

        const [amount, placedAt] = await this._redis.hmget(metaKey, [
            ...BiddingRepository._metaFields,
        ])

        if (amount && placedAt) {
            return {
                userId,
                amount,
                bidPlacedAt: new Date(Number(placedAt)),
            }
        }

        const score = await this._redis.zscore(this._bidsKey(auctionId), userId)
        if (!score) {
            return null
        }

        return {
            userId,
            amount: this._decodeAmount(score),
            bidPlacedAt: new Date(0),
        }
    }

    /**
     * Преобразует ответ Redis WITHSCORES в список участников.
     */
    private _parseWithScores(raw: string[]): IBidder[] {
        const result: IBidder[] = []

        for (let i = 0; i < raw.length; i += 2) {
            const userId = raw[i]
            const score = raw[i + 1]
            if (!userId || !score) {
                continue
            }

            result.push({
                userId,
                amount: this._decodeAmount(score),
                bidPlacedAt: new Date(0),
            })
        }

        return result
    }
}
