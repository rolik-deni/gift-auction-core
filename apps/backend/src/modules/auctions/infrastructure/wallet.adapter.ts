import { Money } from '@libs/ddd'
import {
    ChargeLockedCommand,
    LockFundsCommand,
    UnlockFundsCommand,
} from '@modules/wallets/commands'
import { Inject, Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { WalletPort } from '../domain/ports/wallet.port'

@Injectable()
export class WalletAdapter implements WalletPort {
    constructor(
        @Inject(CommandBus)
        private readonly _commandBus: CommandBus,
    ) {}

    async lockFunds(walletId: string, amount: Money): Promise<void> {
        await this._commandBus.execute(
            new LockFundsCommand({
                walletId,
                amount: amount.amount.toFixed(),
            }),
        )
    }

    async unlockFunds(walletId: string, amount: Money): Promise<void> {
        await this._commandBus.execute(
            new UnlockFundsCommand({
                walletId,
                amount: amount.amount.toFixed(),
            }),
        )
    }

    async chargeLocked(walletId: string, amount: Money): Promise<void> {
        await this._commandBus.execute(
            new ChargeLockedCommand({
                walletId,
                amount: amount.amount.toFixed(),
            }),
        )
    }
}
