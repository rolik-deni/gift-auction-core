import { QueryBase } from '@libs/ddd'

export class GetAuctionHistoryQuery extends QueryBase {
    constructor(readonly auctionId: string) {
        super()
    }
}
