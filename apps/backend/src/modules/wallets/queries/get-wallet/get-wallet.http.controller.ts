import { Controller, Get, Param } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

import { WalletResponseDto } from '../../dtos'
import { GetWalletQuery } from './get-wallet.query'

@Controller('wallets')
export class GetWalletHttpController {
    constructor(private readonly _queryBus: QueryBus) {}

    @ApiOperation({ summary: 'Get wallet' })
    @ApiResponse({ status: 200, type: WalletResponseDto })
    @Get(':walletId')
    async getWallet(
        @Param('walletId') walletId: string,
    ): Promise<WalletResponseDto> {
        const query = new GetWalletQuery(walletId)
        const result = await this._queryBus.execute<
            GetWalletQuery,
            WalletResponseDto
        >(query)
        return result
    }
}
