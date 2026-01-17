import { ValueObject } from '@libs/ddd'
import {
    ArgumentInvalidException,
    ArgumentOutOfRangeException,
} from '@libs/exceptions'
import { BigNumber } from 'bignumber.js'

export type MoneyProps = {
    amount: BigNumber
    currency: string
}

export class Money extends ValueObject<MoneyProps> {
    get amount(): BigNumber {
        return this.props.amount
    }

    get currency(): string {
        return this.props.currency
    }

    static create(amount: BigNumber.Value, currency = 'XTR'): Money {
        return new Money({ amount: new BigNumber(amount), currency })
    }

    add(other: Money): Money {
        this._assertSameCurrency(other)
        return Money.create(this.amount.plus(other.amount), this.currency)
    }

    subtract(other: Money): Money {
        this._assertSameCurrency(other)
        return Money.create(this.amount.minus(other.amount), this.currency)
    }

    equals(other: Money): boolean {
        return (
            this.currency === other.currency &&
            this.amount.isEqualTo(other.amount)
        )
    }

    isGreaterThanOrEqual(other: Money): boolean {
        this._assertSameCurrency(other)
        return this.amount.isGreaterThanOrEqualTo(other.amount)
    }

    protected validate(props: MoneyProps): void {
        if (!props.currency) {
            throw new ArgumentInvalidException('Currency is required')
        }
        if (props.amount.isNaN()) {
            throw new ArgumentInvalidException('Amount must be a number')
        }
        if (props.amount.isNegative()) {
            throw new ArgumentOutOfRangeException('Amount cannot be negative')
        }
    }

    private _assertSameCurrency(other: Money): void {
        if (this.currency !== other.currency) {
            throw new ArgumentInvalidException('Currency mismatch')
        }
    }
}
