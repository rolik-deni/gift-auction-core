import { Command, CommandProps } from '@libs/ddd'

export class CreateWalletCommand extends Command {
    readonly userId: string

    constructor(props: CommandProps<CreateWalletCommand>) {
        super(props)
        this.userId = props.userId
    }
}
