import { AggregateID, AggregateRoot, CreateEntityProps } from '@libs/ddd'
import { ArgumentNotProvidedException } from '@libs/exceptions'

import { WalletCreatedDomainEvent } from './events'
import { Money } from './value-objects'
import { WalletInsufficientFundsError } from './wallet.errors'
import { CreateWalletProps, WalletProps } from './wallet.types'

export class WalletEntity extends AggregateRoot<WalletProps> {
    protected readonly _id: AggregateID

    constructor(props: CreateEntityProps<WalletProps>) {
        super(props)
        this._id = props.id
    }

    static create(create: CreateWalletProps): WalletEntity {
        const id = create.userId
        const props: WalletProps = {
            ...create,
            balance: Money.create(0),
            locked: Money.create(0),
        }
        const wallet = new WalletEntity({ id, props })

        wallet.addEvent(
            new WalletCreatedDomainEvent({
                aggregateId: id,
                userId: create.userId,
            }),
        )

        return wallet
    }

    deposit(amount: Money): void {
        this.props.balance = this.props.balance.add(amount)
    }

    lockFunds(amount: Money): void {
        if (!this.props.balance.isGreaterThanOrEqual(amount)) {
            throw new WalletInsufficientFundsError()
        }

        this.props.balance = this.props.balance.subtract(amount)
        this.props.locked = this.props.locked.add(amount)
    }

    unlockFunds(amount: Money): void {
        if (!this.props.locked.isGreaterThanOrEqual(amount)) {
            throw new WalletInsufficientFundsError()
        }

        this.props.locked = this.props.locked.subtract(amount)
        this.props.balance = this.props.balance.add(amount)
    }

    chargeLocked(amount: Money): void {
        if (!this.props.locked.isGreaterThanOrEqual(amount)) {
            throw new WalletInsufficientFundsError()
        }

        this.props.locked = this.props.locked.subtract(amount)
    }

    validate(): void {
        if (!this.props.userId) {
            throw new ArgumentNotProvidedException('User id is required')
        }
    }
}
