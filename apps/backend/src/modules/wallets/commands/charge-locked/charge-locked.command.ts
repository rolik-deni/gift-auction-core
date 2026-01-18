import { Command, CommandProps } from '@libs/ddd'

export class ChargeLockedCommand extends Command {
    readonly walletId: string
    readonly amount: string

    constructor(props: CommandProps<ChargeLockedCommand>) {
        super(props)
        this.walletId = props.walletId
        this.amount = props.amount
    }
}
