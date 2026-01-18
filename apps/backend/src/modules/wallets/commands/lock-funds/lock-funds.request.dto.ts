import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, IsString, MinLength } from 'class-validator'

export class LockFundsRequestDto {
    @ApiProperty({ example: 'wallet-uuid' })
    @IsString()
    @MinLength(1)
    readonly walletId: string

    @ApiProperty({ example: '10.00' })
    @IsNumberString()
    readonly amount: string
}
