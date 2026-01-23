export type BotType = 'normal' | 'sniper'

export type Bot = {
    id: string
    type: BotType
    currentBid: string
}

export type BotPool = {
    auctionId: string
    normalBots: Bot[]
    sniperBots: Bot[]
    extensionsUsed: number
    extensionsLimit: number
    activeRound: number
    lastRoundEndsAtMs?: number
    timers: Set<NodeJS.Timeout>
}
