import { ApiProperty } from '@nestjs/swagger'

export class GetUserResponseDto {
    @ApiProperty({ example: '2cdc8ab1-6d50-49cc-ba14-54e4ac7ec231' })
    readonly id: string

    @ApiProperty({ example: 'Cynthia Beatty' })
    readonly name: string

    constructor(props: { id: string; name: string }) {
        this.id = props.id
        this.name = props.name
    }
}
