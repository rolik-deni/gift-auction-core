import { AggregateID, Money } from '@libs/ddd'
import { getLogContext, inspectInline } from '@libs/utils'
import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import type { WalletRepositoryPort } from '../../database'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { UnlockFundsCommand } from './unlock-funds.command'

@CommandHandler(UnlockFundsCommand)
export class UnlockFundsService implements ICommandHandler<
    UnlockFundsCommand,
    AggregateID
> {
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        UnlockFundsService.name,
    )

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

        this._logger.debug(
            `Wallet funds unlocked (${inspectInline({
                walletId: command.walletId,
                amount: command.amount,
            })})`,
            this._getLogContext(this.execute.name),
        )

        return wallet.id
    }
}
