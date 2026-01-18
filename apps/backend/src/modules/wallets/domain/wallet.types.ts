import { Money } from './value-objects/money.value-object'

export interface CreateWalletProps {
    userId: string
}

export interface WalletProps extends CreateWalletProps {
    balance: Money
    locked: Money
}
