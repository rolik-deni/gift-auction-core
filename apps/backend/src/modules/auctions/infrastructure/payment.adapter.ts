import { Money } from '@libs/ddd'
import { LockFundsCommand } from '@modules/wallets/commands'
import { Inject, Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'

import { PaymentPort } from '../domain/ports/payment.port'

@Injectable()
export class PaymentAdapter implements PaymentPort {
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
}
