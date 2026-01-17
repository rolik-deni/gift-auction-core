export class WalletInsufficientFundsError extends Error {
    static readonly message = 'Insufficient funds'

    constructor(message = WalletInsufficientFundsError.message) {
        super(message)
    }
}
