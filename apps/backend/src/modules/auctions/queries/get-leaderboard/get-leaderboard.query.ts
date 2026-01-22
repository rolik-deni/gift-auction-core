import { QueryBase } from '@libs/ddd'

export class GetLeaderboardQuery extends QueryBase {
    constructor(
        readonly auctionId: string,
        readonly userId?: string,
    ) {
        super()
    }
}
