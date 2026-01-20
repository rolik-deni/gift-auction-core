import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { AuctionSchedulerPort } from '../domain/ports'

@Injectable()
export class AuctionSchedulerAdapter implements AuctionSchedulerPort {
    constructor(
        @InjectQueue('auction')
        private readonly _queue: Queue,
    ) {}

    async scheduleRoundEnd(
        auctionId: string,
        roundNumber: number,
        endsAt: Date,
    ): Promise<void> {
        const delay = Math.max(endsAt.getTime() - Date.now(), 0)
        await this._queue.add(
            'settle-round',
            { auctionId, roundNumber },
            {
                jobId: this._createJobId(auctionId, roundNumber),
                delay,
                removeOnComplete: true,
                removeOnFail: true,
            },
        )
    }

    private _createJobId(auctionId: string, roundNumber: number): string {
        return `settle-round-${auctionId}-${roundNumber}`
    }
}
