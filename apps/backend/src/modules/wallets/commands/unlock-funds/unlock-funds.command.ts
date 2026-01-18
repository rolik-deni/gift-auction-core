import { Command, CommandProps } from '@libs/ddd'

export class UnlockFundsCommand extends Command {
    readonly walletId: string
    readonly amount: string

    constructor(props: CommandProps<UnlockFundsCommand>) {
        super(props)
        this.walletId = props.walletId
        this.amount = props.amount
    }
}
