import { QueryBase } from '@libs/ddd'

import { AuctionStatus } from '../../domain'

export type GetAuctionsQueryProps = {
    ids?: string[]
    statuses?: AuctionStatus[]
    currentRoundNumbers?: number[]
}

export class GetAuctionsQuery extends QueryBase {
    readonly ids?: string[]
    readonly statuses?: AuctionStatus[]
    readonly currentRoundNumbers?: number[]

    constructor(props: GetAuctionsQueryProps) {
        super()
        this.ids = props.ids
        this.statuses = props.statuses
        this.currentRoundNumbers = props.currentRoundNumbers
    }
}
