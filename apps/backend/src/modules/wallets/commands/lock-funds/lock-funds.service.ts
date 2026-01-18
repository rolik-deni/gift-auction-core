import { AggregateID } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import type { WalletRepositoryPort } from '../../database'
import { Money } from '../../domain'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { LockFundsCommand } from './lock-funds.command'

@CommandHandler(LockFundsCommand)
export class LockFundsService implements ICommandHandler<
    LockFundsCommand,
    AggregateID
> {
    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
    ) {}

    async execute(command: LockFundsCommand): Promise<AggregateID> {
        const wallet = await this._walletRepository.findOne(
            { id: command.walletId },
            true,
        )

        wallet.lockFunds(Money.create(command.amount))
        await this._walletRepository.save(wallet)

        return wallet.id
    }
}
