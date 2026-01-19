import { Money } from '@libs/ddd'

export interface CreateWalletProps {
    userId: string
}

export interface WalletProps extends CreateWalletProps {
    balance: Money
    locked: Money
}
