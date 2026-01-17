import { Money } from './value-objects/money.vo'

export interface CreateWalletProps {
    userId: string
}

export interface WalletProps extends CreateWalletProps {
    balance: Money
    locked: Money
}
