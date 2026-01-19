import { BaseResponseProps, ResponseBase } from '@libs/api/response.base'
import { ApiProperty } from '@nestjs/swagger'

import { AuctionStatus } from '../domain'

export interface AuctionResponseProps extends BaseResponseProps {
    title: string
    status: AuctionStatus
    totalItems: number
    itemsPerRound: number
    roundsTotal: number
    roundDurationSeconds: number
    currentRoundNumber: number
    currentRoundEndsAt: Date | null
    entryPriceAmount: string
    entryPriceCurrency: string
}

export class AuctionResponseDto extends ResponseBase {
    constructor(props: AuctionResponseProps) {
        super(props)
        this.title = props.title
        this.status = props.status
        this.totalItems = props.totalItems
        this.itemsPerRound = props.itemsPerRound
        this.roundsTotal = props.roundsTotal
        this.roundDurationSeconds = props.roundDurationSeconds
        this.currentRoundNumber = props.currentRoundNumber
        this.currentRoundEndsAt = props.currentRoundEndsAt
            ? new Date(props.currentRoundEndsAt).toISOString()
            : null
        this.entryPriceAmount = props.entryPriceAmount
        this.entryPriceCurrency = props.entryPriceCurrency
    }

    @ApiProperty({ example: 'Gift auction' })
    readonly title: string

    @ApiProperty({ example: 'CREATED', enum: AuctionStatus })
    readonly status: AuctionStatus

    @ApiProperty({ example: 1000 })
    readonly totalItems: number

    @ApiProperty({ example: 100 })
    readonly itemsPerRound: number

    @ApiProperty({ example: 10 })
    readonly roundsTotal: number

    @ApiProperty({ example: 60 })
    readonly roundDurationSeconds: number

    @ApiProperty({ example: 1 })
    readonly currentRoundNumber: number

    @ApiProperty({
        example: '2020-11-24T17:43:15.970Z',
        nullable: true,
    })
    readonly currentRoundEndsAt: string | null

    @ApiProperty({ example: '10' })
    readonly entryPriceAmount: string

    @ApiProperty({ example: 'XTR' })
    readonly entryPriceCurrency: string
}
