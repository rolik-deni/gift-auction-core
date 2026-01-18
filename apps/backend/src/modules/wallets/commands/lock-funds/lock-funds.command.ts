import { Command, CommandProps } from '@libs/ddd'

export class LockFundsCommand extends Command {
    readonly walletId: string
    readonly amount: string

    constructor(props: CommandProps<LockFundsCommand>) {
        super(props)
        this.walletId = props.walletId
        this.amount = props.amount
    }
}
