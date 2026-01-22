import { QueryBase } from '@libs/ddd'

export class GetUserQuery extends QueryBase {
    constructor(readonly userId: string) {
        super()
    }
}
