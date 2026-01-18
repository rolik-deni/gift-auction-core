import { QueryBase } from '@libs/ddd'

export class GetWalletQuery extends QueryBase {
    constructor(readonly walletId: string) {
        super()
    }
}
