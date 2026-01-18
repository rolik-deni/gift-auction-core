import { UserCreatedDomainEvent } from '@modules/users/domain/events/user-created.domain-event'
import type { WalletRepositoryPort } from '@modules/wallets/database'
import { WalletEntity } from '@modules/wallets/domain'
import { WALLET_REPOSITORY } from '@modules/wallets/wallet.di-tokens'
import { Inject, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class CreateWalletWhenUserIsCreatedDomainEventHandler {
    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
    ) {}

    @OnEvent(UserCreatedDomainEvent.name, { async: true, promisify: true })
    async handle(event: UserCreatedDomainEvent): Promise<void> {
        const wallet = WalletEntity.create({ userId: event.aggregateId })
        await this._walletRepository.save(wallet)
    }
}
