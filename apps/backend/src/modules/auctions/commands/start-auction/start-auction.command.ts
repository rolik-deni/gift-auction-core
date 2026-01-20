import { Command, CommandProps } from '@libs/ddd'

export class StartAuctionCommand extends Command {
    readonly auctionId: string

    constructor(props: CommandProps<StartAuctionCommand>) {
        super(props)
        this.auctionId = props.auctionId
    }
}
