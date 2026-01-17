import { Command, CommandProps } from '@libs/ddd'

export class DepositFundsCommand extends Command {
    readonly walletId: string
    readonly amount: string
    readonly currency?: string

    constructor(props: CommandProps<DepositFundsCommand>) {
        super(props)
        this.walletId = props.walletId
        this.amount = props.amount
        this.currency = props.currency
    }
}
