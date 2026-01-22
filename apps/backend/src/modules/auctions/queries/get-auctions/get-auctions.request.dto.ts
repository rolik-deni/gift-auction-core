import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator'

import { AuctionStatus } from '../../domain/auction.types'

export class GetAuctionsRequestDto {
    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    @IsArray()
    @IsString({ each: true })
    readonly ids?: string[]

    @ApiPropertyOptional({
        enum: AuctionStatus,
        isArray: true,
    })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    @IsArray()
    @IsEnum(AuctionStatus, { each: true })
    readonly statuses?: AuctionStatus[]

    @ApiPropertyOptional({ type: [Number] })
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
    @IsArray()
    @IsInt({ each: true })
    readonly currentRoundNumbers?: number[]
}
