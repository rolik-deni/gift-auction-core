import { AggregateID } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import type { WalletRepositoryPort } from '../../database'
import { Money } from '../../domain'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { UnlockFundsCommand } from './unlock-funds.command'

@CommandHandler(UnlockFundsCommand)
export class UnlockFundsService implements ICommandHandler<
    UnlockFundsCommand,
    AggregateID
> {
    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
    ) {}

    async execute(command: UnlockFundsCommand): Promise<AggregateID> {
        const wallet = await this._walletRepository.findOne(
            { id: command.walletId },
            true,
        )

        wallet.unlockFunds(Money.create(command.amount))
        await this._walletRepository.save(wallet)

        return wallet.id
    }
}
