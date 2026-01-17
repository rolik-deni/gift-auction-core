import { ApiProperty } from '@nestjs/swagger'
import {
    IsNumberString,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator'

export class DepositFundsRequestDto {
    @ApiProperty({ example: 'wallet-uuid' })
    @IsString()
    @MinLength(1)
    readonly walletId: string

    @ApiProperty({ example: '100.50' })
    @IsNumberString()
    readonly amount: string

    @ApiProperty({ example: 'XTR', required: false })
    @IsOptional()
    @IsString()
    readonly currency?: string
}
