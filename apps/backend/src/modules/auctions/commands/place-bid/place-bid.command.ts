import { Command, CommandProps } from '@libs/ddd'

export class PlaceBidCommand extends Command {
    readonly auctionId: string
    readonly userId: string
    readonly amount: string

    constructor(props: CommandProps<PlaceBidCommand>) {
        super(props)
        this.auctionId = props.auctionId
        this.userId = props.userId
        this.amount = props.amount
    }
}
