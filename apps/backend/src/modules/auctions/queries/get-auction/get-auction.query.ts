import { QueryBase } from '@libs/ddd'

export class GetAuctionQuery extends QueryBase {
    constructor(readonly auctionId: string) {
        super()
    }
}
