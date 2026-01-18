import { ExceptionBase } from '@libs/exceptions'

export class WalletAlreadyExistsError extends ExceptionBase {
    static readonly message = 'Wallet already exists'

    readonly code = 'WALLET.ALREADY_EXISTS'

    constructor(cause?: Error, metadata?: unknown) {
        super(WalletAlreadyExistsError.message, cause, metadata)
    }
}

export class WalletInsufficientFundsError extends ExceptionBase {
    static readonly message = 'Insufficient funds'

    readonly code = 'WALLET.INSUFFICIENT_FUNDS'

    constructor(cause?: Error, metadata?: unknown) {
        super(WalletAlreadyExistsError.message, cause, metadata)
    }
}
