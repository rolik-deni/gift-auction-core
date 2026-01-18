import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import type { WalletRepositoryPort } from '../../database'
import { WalletResponseDto } from '../../dtos'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { WalletMapper } from '../../wallet.mapper'
import { GetWalletQuery } from './get-wallet.query'

@QueryHandler(GetWalletQuery)
export class GetWalletService implements IQueryHandler<
    GetWalletQuery,
    WalletResponseDto
> {
    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
        private readonly _mapper: WalletMapper,
    ) {}

    async execute(query: GetWalletQuery): Promise<WalletResponseDto> {
        const wallet = await this._walletRepository.findOne(
            { id: query.walletId },
            true,
        )
        return this._mapper.toResponse(wallet)
    }
}
