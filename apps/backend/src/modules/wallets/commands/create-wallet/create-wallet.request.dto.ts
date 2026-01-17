import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class CreateWalletRequestDto {
    @ApiProperty({ example: 'user-uuid' })
    @IsString()
    @MinLength(1)
    readonly userId: string
}
