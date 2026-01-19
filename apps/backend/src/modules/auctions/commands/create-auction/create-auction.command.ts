import { Command, CommandProps } from '@libs/ddd'

export class CreateAuctionCommand extends Command {
    readonly title: string
    readonly totalItems: number
    readonly roundsTotal: number
    readonly roundDurationSeconds: number
    readonly entryPriceAmount: string
    readonly entryPriceCurrency?: string

    constructor(props: CommandProps<CreateAuctionCommand>) {
        super(props)
        this.title = props.title
        this.totalItems = props.totalItems
        this.roundsTotal = props.roundsTotal
        this.roundDurationSeconds = props.roundDurationSeconds
        this.entryPriceAmount = props.entryPriceAmount
        this.entryPriceCurrency = props.entryPriceCurrency
    }
}
