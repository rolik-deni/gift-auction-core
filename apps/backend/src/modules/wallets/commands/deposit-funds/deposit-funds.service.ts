import { AggregateID, Money } from '@libs/ddd'
import { getLogContext, inspectInline } from '@libs/utils'
import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import type { WalletRepositoryPort } from '../../database'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { DepositFundsCommand } from './deposit-funds.command'

@CommandHandler(DepositFundsCommand)
export class DepositFundsService implements ICommandHandler<
    DepositFundsCommand,
    AggregateID
> {
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        DepositFundsService.name,
    )

    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
    ) {}

    async execute(command: DepositFundsCommand): Promise<AggregateID> {
        const wallet = await this._walletRepository.findOne(
            { id: command.walletId },
            true,
        )
        wallet.deposit(Money.create(command.amount, command.currency))
        await this._walletRepository.save(wallet)

        this._logger.debug(
            `Wallet deposit (${inspectInline({
                walletId: command.walletId,
                amount: command.amount,
            })})`,
            this._getLogContext(this.execute.name),
        )

        return wallet.id
    }
}
