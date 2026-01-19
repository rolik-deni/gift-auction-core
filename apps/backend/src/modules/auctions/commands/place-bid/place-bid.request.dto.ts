import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator'

export class PlaceBidRequestDto {
    @ApiProperty({ example: 'user-uuid' })
    @IsString()
    @IsNotEmpty()
    readonly userId: string

    @ApiProperty({ example: '10.00' })
    @IsNumberString()
    readonly amount: string
}
