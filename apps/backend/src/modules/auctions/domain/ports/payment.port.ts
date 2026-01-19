import { Money } from '@libs/ddd'

export interface PaymentPort {
    lockFunds(walletId: string, amount: Money): Promise<void>
}
