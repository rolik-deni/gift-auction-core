export type BotsConfig = {
    enabled: boolean
    normalCount: number
    normalDeposit: number
    normalStopBeforeEndSec: number
    normalBidIntervalMsMin: number
    normalBidIntervalMsMax: number
    normalBidStepMin: number
    normalBidStepMax: number
    sniperCount: number
    sniperDeposit: number
    sniperBurstBeforeEndSec: number
    sniperExtensionsMin: number
    sniperExtensionsMax: number
    sniperBurstSizeMin: number
    sniperBurstSizeMax: number
    globalMaxRps: number
}

const toNumber = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) {
        return fallback
    }
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

export const getBotsConfig = (): BotsConfig => ({
    enabled: toBoolean(process.env.BOTS_ENABLED, false),
    normalCount: toNumber(process.env.BOTS_NORMAL_COUNT, 30),
    normalDeposit: toNumber(process.env.BOTS_NORMAL_DEPOSIT, 10000),
    normalStopBeforeEndSec: toNumber(
        process.env.BOTS_NORMAL_STOP_BEFORE_END_SEC,
        30,
    ),
    normalBidIntervalMsMin: toNumber(
        process.env.BOTS_NORMAL_BID_INTERVAL_MS_MIN,
        400,
    ),
    normalBidIntervalMsMax: toNumber(
        process.env.BOTS_NORMAL_BID_INTERVAL_MS_MAX,
        1500,
    ),
    normalBidStepMin: toNumber(process.env.BOTS_NORMAL_BID_STEP_MIN, 1),
    normalBidStepMax: toNumber(process.env.BOTS_NORMAL_BID_STEP_MAX, 25),
    sniperCount: toNumber(process.env.BOTS_SNIPER_COUNT, 15),
    sniperDeposit: toNumber(process.env.BOTS_SNIPER_DEPOSIT, 10000),
    sniperBurstBeforeEndSec: toNumber(
        process.env.BOTS_SNIPER_BURST_BEFORE_END_SEC,
        5,
    ),
    sniperExtensionsMin: toNumber(process.env.BOTS_SNIPER_EXTENSIONS_MIN, 1),
    sniperExtensionsMax: toNumber(process.env.BOTS_SNIPER_EXTENSIONS_MAX, 2),
    sniperBurstSizeMin: toNumber(process.env.BOTS_SNIPER_BURST_SIZE_MIN, 20),
    sniperBurstSizeMax: toNumber(process.env.BOTS_SNIPER_BURST_SIZE_MAX, 60),
    globalMaxRps: toNumber(process.env.BOTS_GLOBAL_MAX_RPS, 100),
})
