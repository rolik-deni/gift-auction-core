import { Money } from '@libs/ddd'

export interface WalletPort {
    lockFunds(walletId: string, amount: Money): Promise<void>
    unlockFunds(walletId: string, amount: Money): Promise<void>
    chargeLocked(walletId: string, amount: Money): Promise<void>
}
