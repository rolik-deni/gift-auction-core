import { ApiProperty } from '@nestjs/swagger'

export class LeaderboardEntryDto {
    @ApiProperty({ example: 1 })
    rank: number

    @ApiProperty({ example: 'user-uuid' })
    userId: string

    @ApiProperty({ example: 'John Doe' })
    userName: string

    @ApiProperty({ example: '150.00' })
    amount: string

    @ApiProperty({ example: '2020-11-24T17:43:15.970Z' })
    bidPlacedAt: string
}

export class LeaderboardMeDto {
    @ApiProperty({ example: 5 })
    rank: number

    @ApiProperty({ example: '150.00' })
    amount: string

    @ApiProperty({ example: true })
    isWinning: boolean

    @ApiProperty({ example: '2020-11-24T17:43:15.970Z' })
    bidPlacedAt: string
}

export class GetLeaderboardResponseDto {
    @ApiProperty({ type: [LeaderboardEntryDto] })
    top: LeaderboardEntryDto[]

    @ApiProperty({ type: LeaderboardMeDto, nullable: true })
    me: LeaderboardMeDto | null
}
