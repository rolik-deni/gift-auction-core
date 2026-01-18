import { BaseResponseProps, ResponseBase } from '@libs/api/response.base'
import { ApiProperty } from '@nestjs/swagger'

export interface WalletResponseProps extends BaseResponseProps {
    userId: string
    currency: string
    balanceAmount: string
    lockedAmount: string
}

export class WalletResponseDto extends ResponseBase {
    constructor(props: WalletResponseProps) {
        super(props)
    }

    @ApiProperty({ example: 'user-uuid' })
    readonly userId: string

    @ApiProperty({ example: 'XTR' })
    readonly currency: string

    @ApiProperty({ example: '0' })
    readonly balanceAmount: string

    @ApiProperty({ example: '0' })
    readonly lockedAmount: string
}
