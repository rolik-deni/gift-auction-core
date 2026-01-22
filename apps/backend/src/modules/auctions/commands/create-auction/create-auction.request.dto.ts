import { ApiProperty } from '@nestjs/swagger'
import {
    IsInt,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsString,
    Min,
} from 'class-validator'

export class CreateAuctionRequestDto {
    @ApiProperty({ example: 'Gift auction' })
    @IsString()
    @IsNotEmpty()
    readonly title: string

    @ApiProperty({ example: 'Replicator' })
    @IsString()
    @IsNotEmpty()
    readonly giftName: string

    @ApiProperty({ example: 1000 })
    @IsInt()
    @Min(1)
    readonly totalItems: number

    @ApiProperty({ example: 10 })
    @IsInt()
    @Min(1)
    readonly roundsTotal: number

    @ApiProperty({ example: 60 })
    @IsInt()
    @Min(1)
    readonly roundDurationSeconds: number

    @ApiProperty({ example: '10.00' })
    @IsNumberString()
    readonly entryPriceAmount: string

    @ApiProperty({ example: 'XTR', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    readonly entryPriceCurrency?: string
}
