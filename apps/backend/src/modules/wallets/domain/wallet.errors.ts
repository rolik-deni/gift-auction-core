import { ExceptionBase, NOT_FOUND } from '@libs/exceptions'

export class WalletNotFoundException extends ExceptionBase {
    static readonly message = 'Wallet not found'

    readonly code = NOT_FOUND

    constructor(cause?: Error, metadata?: unknown) {
        super(WalletNotFoundException.message, cause, metadata)
    }
}

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
        super(WalletInsufficientFundsError.message, cause, metadata)
    }
}
