import { ApiProperty } from '@nestjs/swagger'

export class AuctionHistoryWinnerDto {
    @ApiProperty({ example: 1 })
    rank: number

    @ApiProperty({ example: 'user-uuid' })
    userId: string

    @ApiProperty({ example: '150.00' })
    bidAmount: string

    @ApiProperty({ example: '2020-11-24T17:43:15.970Z' })
    bidPlacedAt: string
}

export class AuctionHistoryRoundDto {
    @ApiProperty({ example: 1 })
    roundNumber: number

    @ApiProperty({ type: [AuctionHistoryWinnerDto] })
    winners: AuctionHistoryWinnerDto[]
}

export class GetAuctionHistoryResponseDto {
    @ApiProperty({ type: [AuctionHistoryRoundDto] })
    rounds: AuctionHistoryRoundDto[]
}
