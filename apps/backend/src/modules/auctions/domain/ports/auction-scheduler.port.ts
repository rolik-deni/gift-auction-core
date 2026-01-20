export interface AuctionSchedulerPort {
    scheduleRoundEnd(
        auctionId: string,
        roundNumber: number,
        endsAt: Date,
    ): Promise<void>
}
