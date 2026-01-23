import { getLogContext, inspectInline } from '@libs/utils'
import { PlaceBidCommand } from '@modules/auctions/commands'
import { AuctionStatus } from '@modules/auctions/domain'
import {
    AuctionCompletedEvent,
    AuctionRoundStartedEvent,
    AuctionStartedEvent,
} from '@modules/auctions/domain/events'
import { AuctionResponseDto } from '@modules/auctions/dtos'
import { GetAuctionQuery, GetLeaderboardQuery } from '@modules/auctions/queries'
import { GetLeaderboardResponseDto } from '@modules/auctions/queries/get-leaderboard'
import { CreateUserCommand } from '@modules/users/commands'
import { DepositFundsCommand } from '@modules/wallets/commands'
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { OnEvent } from '@nestjs/event-emitter'
import { BigNumber } from 'bignumber.js'

import { getBotsConfig } from './bots.config'
import { Bot, BotPool } from './bots.types'
import { SimpleRateLimiter } from './rate-limiter'

const toNumber = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const ANTI_SNIPING_THRESHOLD_MS = toNumber(
    process.env.AUCTIONS_ANTI_SNIPING_THRESHOLD_MS,
    30_000,
)
const EXTENSION_POLL_INTERVAL_MS = 2_000

type RetryOptions = {
    attempts: number
    backoffMs: number
    isRetriable: (error: unknown) => boolean
}

@Injectable()
export class BotsService implements OnModuleDestroy {
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(this, BotsService.name)

    private readonly _config = getBotsConfig()
    private readonly _pools = new Map<string, BotPool>()
    private readonly _rateLimiter = new SimpleRateLimiter(
        this._config.globalMaxRps,
    )

    constructor(
        private readonly _commandBus: CommandBus,
        private readonly _queryBus: QueryBus,
    ) {}

    @OnEvent(AuctionRoundStartedEvent.name, { async: true, promisify: true })
    async onAuctionRoundStarted(
        event: AuctionRoundStartedEvent,
    ): Promise<void> {
        await this._handleRoundStart(event.aggregateId, event.roundNumber)
    }

    @OnEvent(AuctionStartedEvent.name, { async: true, promisify: true })
    async onAuctionStarted(event: AuctionStartedEvent): Promise<void> {
        await this._handleRoundStart(event.aggregateId)
    }

    @OnEvent(AuctionCompletedEvent.name, { async: true, promisify: true })
    onAuctionCompleted(event: AuctionCompletedEvent): void {
        const pool = this._pools.get(event.aggregateId)
        if (!pool) {
            return
        }

        this._clearTimers(pool)
        this._pools.delete(event.aggregateId)
        this._logger.log(
            `Bots stopped (${inspectInline({ auctionId: event.aggregateId })})`,
            this._getLogContext(this.onAuctionCompleted.name),
        )
    }

    onModuleDestroy(): void {
        for (const pool of this._pools.values()) {
            this._clearTimers(pool)
        }
        this._pools.clear()
        this._rateLimiter.shutdown()
    }

    private async _createPool(auctionId: string): Promise<BotPool | undefined> {
        const extensionsLimit = this._randomInt(
            this._config.sniperExtensionsMin,
            this._config.sniperExtensionsMax,
        )

        const pool: BotPool = {
            auctionId,
            normalBots: [],
            sniperBots: [],
            extensionsUsed: 0,
            extensionsLimit,
            activeRound: 0,
            timers: new Set(),
        }

        try {
            this._logger.log(
                `Creating bots pool for auction (${inspectInline({
                    auctionId,
                    normal: this._config.normalCount,
                    sniper: this._config.sniperCount,
                })})`,
                this._getLogContext(this._createPool.name),
            )

            pool.normalBots = await this._createBots(
                this._config.normalCount,
                this._config.normalDeposit,
                'normal',
            )
            pool.sniperBots = await this._createBots(
                this._config.sniperCount,
                this._config.sniperDeposit,
                'sniper',
            )

            return pool
        } catch (error) {
            this._logger.error(
                `Failed to create bots pool for auction ${auctionId}: ` +
                    `${this._errorMessage(error)}`,
                undefined,
                this._getLogContext(this._createPool.name),
            )
            return undefined
        }
    }

    private async _createBots(
        count: number,
        depositAmount: number,
        type: Bot['type'],
    ): Promise<Bot[]> {
        const bots: Bot[] = []
        for (let index = 0; index < count; index += 1) {
            const userId = await this._executeWithRetry(
                () =>
                    this._rateLimiter.schedule(() =>
                        this._commandBus.execute(
                            new CreateUserCommand({ name: undefined }),
                        ),
                    ),
                {
                    attempts: 3,
                    backoffMs: 200,
                    isRetriable: (error) => this._isRetriable(error),
                },
            )

            await this._sleep(50)

            await this._executeWithRetry(
                () =>
                    this._rateLimiter.schedule(() =>
                        this._commandBus.execute(
                            new DepositFundsCommand({
                                walletId: userId,
                                amount: depositAmount.toString(),
                            }),
                        ),
                    ),
                {
                    attempts: 3,
                    backoffMs: 300,
                    isRetriable: (error) => this._isRetriable(error),
                },
            )

            bots.push({
                id: userId,
                type,
                currentBid: '0',
            })
        }

        return bots
    }

    private _startNormalBots(
        pool: BotPool,
        auction: AuctionResponseDto,
        endsAtMs: number,
        roundNumber: number,
    ): void {
        if (!pool.normalBots.length) {
            return
        }

        const entryPrice = new BigNumber(auction.entryPriceAmount)
        if (!entryPrice.isFinite() || entryPrice.isNaN()) {
            return
        }

        const stopAtMs = this._resolveNormalStopAtMs(endsAtMs)

        for (const bot of pool.normalBots) {
            this._scheduleNormalBid(
                pool,
                bot,
                auction.id,
                entryPrice,
                stopAtMs,
                roundNumber,
            )
        }
    }

    private _scheduleNormalBid(
        pool: BotPool,
        bot: Bot,
        auctionId: string,
        entryPrice: BigNumber,
        stopAtMs: number,
        roundNumber: number,
    ): void {
        const delay = this._randomInt(
            this._config.normalBidIntervalMsMin,
            this._config.normalBidIntervalMsMax,
        )
        const timer = setTimeout((): void => {
            void this._runNormalBidStep(
                pool,
                bot,
                auctionId,
                entryPrice,
                stopAtMs,
                roundNumber,
                timer,
            )
        }, delay)
        pool.timers.add(timer)
    }

    private _scheduleSniperWindow(
        pool: BotPool,
        auction: AuctionResponseDto,
        endsAtMs: number,
        roundNumber: number,
    ): void {
        if (
            !pool.sniperBots.length ||
            !this._isRoundActive(pool, roundNumber)
        ) {
            return
        }

        const entryPrice = new BigNumber(auction.entryPriceAmount)
        if (!entryPrice.isFinite() || entryPrice.isNaN()) {
            return
        }

        const extendWindowSec = Math.max(
            this._config.normalStopBeforeEndSec,
            30,
        )
        const shouldAvoidExtend = pool.extensionsUsed >= pool.extensionsLimit
        const burstBeforeEndSec = shouldAvoidExtend
            ? extendWindowSec + 5
            : this._config.sniperBurstBeforeEndSec

        const burstAtMs = endsAtMs - burstBeforeEndSec * 1000
        const delay = burstAtMs - Date.now()

        if (delay > 0) {
            const timer = setTimeout((): void => {
                pool.timers.delete(timer)
                if (!this._isRoundActive(pool, roundNumber)) {
                    return
                }
                void this._runSniperBurst(
                    pool,
                    auction.id,
                    entryPrice,
                    roundNumber,
                )
            }, delay)
            pool.timers.add(timer)
        }
    }

    private async _runSniperBurst(
        pool: BotPool,
        auctionId: string,
        entryPrice: BigNumber,
        roundNumber: number,
    ): Promise<void> {
        if (!this._isRoundActive(pool, roundNumber)) {
            return
        }

        const leaderboard = await this._safeGetLeaderboard(auctionId)
        const thirdAmount = leaderboard?.top?.[2]?.amount
        const minBid = thirdAmount ? new BigNumber(thirdAmount) : undefined

        const burstSize = this._randomInt(
            this._config.sniperBurstSizeMin,
            this._config.sniperBurstSizeMax,
        )
        const jitterMs = 2000
        const bots = pool.sniperBots

        for (let index = 0; index < burstSize; index += 1) {
            const bot = bots[index % bots.length]
            const delay = this._randomInt(0, jitterMs)
            const timer = setTimeout((): void => {
                pool.timers.delete(timer)
                if (!this._isRoundActive(pool, roundNumber)) {
                    return
                }
                void this._attemptBid(
                    bot,
                    auctionId,
                    entryPrice,
                    'sniper',
                    minBid,
                )
            }, delay)
            pool.timers.add(timer)
        }
    }

    private async _runNormalBidStep(
        pool: BotPool,
        bot: Bot,
        auctionId: string,
        entryPrice: BigNumber,
        stopAtMs: number,
        roundNumber: number,
        timer: NodeJS.Timeout,
    ): Promise<void> {
        pool.timers.delete(timer)
        if (!this._isRoundActive(pool, roundNumber)) {
            return
        }

        if (Date.now() >= stopAtMs) {
            return
        }

        await this._attemptBid(bot, auctionId, entryPrice, 'normal')

        this._scheduleNormalBid(
            pool,
            bot,
            auctionId,
            entryPrice,
            stopAtMs,
            roundNumber,
        )
    }

    private _scheduleRoundExtensionProbe(
        pool: BotPool,
        auctionId: string,
        roundNumber: number,
        endsAtMs: number,
    ): void {
        const startAtMs = endsAtMs - ANTI_SNIPING_THRESHOLD_MS
        const delay = Math.max(0, startAtMs - Date.now())
        const timer = setTimeout((): void => {
            void this._pollRoundExtension(
                pool,
                auctionId,
                roundNumber,
                endsAtMs,
                timer,
            )
        }, delay)
        pool.timers.add(timer)
    }

    private async _pollRoundExtension(
        pool: BotPool,
        auctionId: string,
        roundNumber: number,
        endsAtMs: number,
        timer: NodeJS.Timeout,
    ): Promise<void> {
        pool.timers.delete(timer)
        if (!this._isRoundActive(pool, roundNumber)) {
            return
        }

        if (Date.now() >= endsAtMs) {
            return
        }

        const updated = await this._safeGetAuction(auctionId)
        if (!updated || updated.status !== AuctionStatus.ACTIVE) {
            return
        }

        const updatedEndsAtMs = this._resolveEndsAtMs(updated)
        if (
            pool.lastRoundEndsAtMs &&
            updatedEndsAtMs > pool.lastRoundEndsAtMs
        ) {
            pool.extensionsUsed += 1
            pool.lastRoundEndsAtMs = updatedEndsAtMs
            this._clearTimers(pool)
            this._startNormalBots(pool, updated, updatedEndsAtMs, roundNumber)
            this._scheduleSniperWindow(
                pool,
                updated,
                updatedEndsAtMs,
                roundNumber,
            )
            this._scheduleRoundExtensionProbe(
                pool,
                auctionId,
                roundNumber,
                updatedEndsAtMs,
            )
            return
        }

        const nextDelay = Math.min(
            EXTENSION_POLL_INTERVAL_MS,
            Math.max(0, endsAtMs - Date.now()),
        )
        if (nextDelay <= 0) {
            return
        }
        const nextTimer = setTimeout((): void => {
            void this._pollRoundExtension(
                pool,
                auctionId,
                roundNumber,
                endsAtMs,
                nextTimer,
            )
        }, nextDelay)
        pool.timers.add(nextTimer)
    }

    private async _attemptBid(
        bot: Bot,
        auctionId: string,
        entryPrice: BigNumber,
        mode: 'normal' | 'sniper',
        minBid?: BigNumber,
    ): Promise<void> {
        const step = this._randomInt(
            this._config.normalBidStepMin,
            this._config.normalBidStepMax,
        )
        const nextBid = this._nextBid(bot.currentBid, entryPrice, step, minBid)

        try {
            await this._executeWithRetry(
                () =>
                    this._rateLimiter.schedule(() =>
                        this._commandBus.execute(
                            new PlaceBidCommand({
                                auctionId,
                                userId: bot.id,
                                amount: nextBid,
                            }),
                        ),
                    ),
                {
                    attempts: 3,
                    backoffMs: 200,
                    isRetriable: (error) => this._isRetriable(error),
                },
            )
            bot.currentBid = nextBid
        } catch (error) {
            const message = this._errorMessage(error)
            if (
                message.includes('Bid must be higher') ||
                message.includes('Auction is not active') ||
                message.includes('Bid is below the entry price')
            ) {
                this._logger.warn(
                    `Bot bid rejected (${mode}). Auction ${auctionId}, ` +
                        `bot ${bot.id}. ${message}`,
                    this._getLogContext(this._attemptBid.name),
                )
                return
            }

            if (!this._isRetriable(error)) {
                this._logger.warn(
                    `Bot bid failed (${mode}). Auction ${auctionId}, ` +
                        `bot ${bot.id}. ${message}`,
                    this._getLogContext(this._attemptBid.name),
                )
            }
        }
    }

    private async _safeGetAuction(
        auctionId: string,
    ): Promise<AuctionResponseDto | null> {
        try {
            return await this._executeWithRetry(
                () =>
                    this._rateLimiter.schedule(() =>
                        this._queryBus.execute(new GetAuctionQuery(auctionId)),
                    ),
                {
                    attempts: 3,
                    backoffMs: 200,
                    isRetriable: (error) => this._isRetriable(error),
                },
            )
        } catch (error) {
            this._logger.warn(
                `Bots failed to fetch auction ${auctionId}: ${this._errorMessage(
                    error,
                )}`,
                this._getLogContext(this._safeGetAuction.name),
            )
            return null
        }
    }

    private async _safeGetLeaderboard(
        auctionId: string,
    ): Promise<GetLeaderboardResponseDto | null> {
        try {
            return await this._executeWithRetry(
                () =>
                    this._rateLimiter.schedule(() =>
                        this._queryBus.execute(
                            new GetLeaderboardQuery(auctionId),
                        ),
                    ),
                {
                    attempts: 2,
                    backoffMs: 200,
                    isRetriable: (error) => this._isRetriable(error),
                },
            )
        } catch (error) {
            this._logger.warn(
                `Bots failed to fetch leaderboard for ${auctionId}: ` +
                    `${this._errorMessage(error)}`,
                this._getLogContext(this._safeGetLeaderboard.name),
            )
            return null
        }
    }

    private _resolveEndsAtMs(auction: AuctionResponseDto): number {
        if (auction.currentRoundEndsAt) {
            return new Date(auction.currentRoundEndsAt).getTime()
        }
        return Date.now() + auction.timeLeftSeconds * 1000
    }

    private _resolveNormalStopAtMs(endsAtMs: number): number {
        const remainingMs = Math.max(0, endsAtMs - Date.now())
        const stopBeforeEndMs = Math.min(
            this._config.normalStopBeforeEndSec * 1000,
            Math.max(1000, Math.floor(remainingMs / 2)),
        )
        return endsAtMs - stopBeforeEndMs
    }

    private _nextBid(
        currentBid: string,
        entryPrice: BigNumber,
        step: number,
        minBid?: BigNumber,
    ): string {
        const current = new BigNumber(currentBid)
        const base = minBid && minBid.isGreaterThan(current) ? minBid : current
        const incremented = base.plus(step)
        const next = incremented.isLessThan(entryPrice)
            ? entryPrice
            : incremented
        return next.toFixed()
    }

    private async _handleRoundStart(
        auctionId: string,
        roundNumber?: number,
    ): Promise<void> {
        if (!this._config.enabled) {
            return
        }

        let pool = this._pools.get(auctionId)
        if (!pool) {
            pool = await this._createPool(auctionId)
            if (!pool) {
                return
            }
            this._pools.set(auctionId, pool)
        }

        this._clearTimers(pool)

        const auction = await this._safeGetAuction(auctionId)
        if (!auction || auction.status !== AuctionStatus.ACTIVE) {
            return
        }

        const activeRound = roundNumber ?? auction.currentRoundNumber
        pool.activeRound = activeRound
        pool.extensionsUsed = 0
        pool.extensionsLimit = this._randomInt(
            this._config.sniperExtensionsMin,
            this._config.sniperExtensionsMax,
        )

        const endsAtMs = this._resolveEndsAtMs(auction)
        pool.lastRoundEndsAtMs = endsAtMs

        this._logger.log(
            `Bots round started (${inspectInline({ auctionId, round: activeRound })})`,
            this._getLogContext(this._handleRoundStart.name),
        )

        this._startNormalBots(pool, auction, endsAtMs, activeRound)
        this._scheduleSniperWindow(pool, auction, endsAtMs, activeRound)
        this._scheduleRoundExtensionProbe(
            pool,
            auctionId,
            activeRound,
            endsAtMs,
        )
    }

    private _clearTimers(pool: BotPool): void {
        for (const timer of pool.timers) {
            clearTimeout(timer)
        }
        pool.timers.clear()
    }

    private _isRoundActive(pool: BotPool, roundNumber: number): boolean {
        return pool.activeRound === roundNumber
    }

    private _randomInt(min: number, max: number): number {
        const normalizedMin = Math.min(min, max)
        const normalizedMax = Math.max(min, max)
        return (
            Math.floor(Math.random() * (normalizedMax - normalizedMin + 1)) +
            normalizedMin
        )
    }

    private async _executeWithRetry<T>(
        task: () => Promise<T>,
        options: RetryOptions,
    ): Promise<T> {
        let lastError: unknown
        for (let attempt = 0; attempt < options.attempts; attempt += 1) {
            try {
                return await task()
            } catch (error) {
                lastError = error
                if (
                    attempt >= options.attempts - 1 ||
                    !options.isRetriable(error)
                ) {
                    break
                }
                await this._sleep(options.backoffMs * (attempt + 1))
            }
        }
        throw lastError
    }

    private _isRetriable(error: unknown): boolean {
        const code = (error as { code?: string })?.code?.toLowerCase?.()
        if (
            code &&
            ['econnreset', 'etimedout', 'econnrefused', 'eai_again'].includes(
                code,
            )
        ) {
            return true
        }

        const message = this._errorMessage(error).toLowerCase()
        return message.includes('timeout') || message.includes('network')
    }

    private _errorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message
        }
        return String(error)
    }

    private _sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
