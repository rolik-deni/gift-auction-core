import { AggregateID } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Ok } from 'oxide.ts'

import type { WalletRepositoryPort } from '../../database'
import { WalletEntity } from '../../domain'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { CreateWalletCommand } from './create-wallet.command'

@CommandHandler(CreateWalletCommand)
export class CreateWalletService implements ICommandHandler<
    CreateWalletCommand,
    Ok<AggregateID>
> {
    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
    ) {}

    async execute(command: CreateWalletCommand): Promise<Ok<AggregateID>> {
        const wallet = WalletEntity.create({ userId: command.userId })

        await this._walletRepository.create(wallet)

        return Ok(wallet.id)
    }
}
