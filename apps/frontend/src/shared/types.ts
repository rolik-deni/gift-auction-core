export type ApiError = {
    message: string
    correlationId?: string
}

export type IdResponse = {
    id: string
}

export type Wallet = {
    userId: string
    currency: string
    balanceAmount: string
    lockedAmount: string
}

export type Auction = {
    id: string
    title: string
    giftName: string
    status: 'CREATED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    totalItems: number
    itemsPerRound: number
    roundsTotal: number
    roundDurationSeconds: number
    currentRoundNumber: number
    currentRoundEndsAt: string | null
    remainingItems: number
    timeLeftSeconds: number
    entryPriceAmount: string
    entryPriceCurrency: string
}

export type LeaderboardEntry = {
    rank: number
    userId: string
    userName: string
    amount: string
    bidPlacedAt: string
}

export type LeaderboardMe = {
    rank: number
    amount: string
    isWinning: boolean
    bidPlacedAt: string
}

export type LeaderboardResponse = {
    top: LeaderboardEntry[]
    me: LeaderboardMe | null
}

export type HistoryWinner = {
    rank: number
    userId: string
    userName: string
    bidAmount: string
    bidPlacedAt: string
}

export type HistoryRound = {
    roundNumber: number
    winners: HistoryWinner[]
}

export type HistoryResponse = {
    rounds: HistoryRound[]
}

export type User = {
    id: string
    name: string
}
