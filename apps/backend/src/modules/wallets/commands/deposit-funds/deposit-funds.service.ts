import { AggregateID } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Ok } from 'oxide.ts'

import type { WalletRepositoryPort } from '../../database'
import { Money } from '../../domain/value-objects/money.vo'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { DepositFundsCommand } from './deposit-funds.command'

@CommandHandler(DepositFundsCommand)
export class DepositFundsService implements ICommandHandler<
    DepositFundsCommand,
    Ok<AggregateID>
> {
    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
    ) {}

    async execute(command: DepositFundsCommand): Promise<Ok<AggregateID>> {
        const wallet = await this._walletRepository.findOne(
            { id: command.walletId },
            true,
        )

        const money = Money.create(command.amount, command.currency)
        wallet.deposit(money)

        await this._walletRepository.save(wallet)

        return Ok(wallet.id)
    }
}
