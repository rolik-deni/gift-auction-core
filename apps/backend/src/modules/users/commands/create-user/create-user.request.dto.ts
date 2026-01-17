import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateUserRequestDto {
    @ApiProperty({ example: 'Cynthia Beatty', required: false })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    readonly name?: string
}
