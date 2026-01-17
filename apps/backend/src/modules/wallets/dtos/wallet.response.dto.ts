import { ResponseBase } from '@libs/api/response.base'
import { ApiProperty } from '@nestjs/swagger'

import { WalletEntity } from '../domain/wallet.entity'

export class WalletResponseDto extends ResponseBase {
    constructor(wallet: WalletEntity) {
        super(wallet.getProps())
        const props = wallet.getProps()
        this.userId = props.userId
        this.balance = props.balance.amount.toFixed()
        this.locked = props.locked.amount.toFixed()
        this.currency = props.balance.currency
    }

    @ApiProperty({ example: 'user-uuid' })
    userId: string

    @ApiProperty({ example: '0' })
    balance: string

    @ApiProperty({ example: '0' })
    locked: string

    @ApiProperty({ example: 'XTR' })
    currency: string
}
