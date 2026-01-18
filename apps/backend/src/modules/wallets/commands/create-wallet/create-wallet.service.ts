import { AggregateID } from '@libs/ddd'
import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

import type { WalletRepositoryPort } from '../../database'
import { WalletAlreadyExistsError, WalletEntity } from '../../domain'
import { WALLET_REPOSITORY } from '../../wallet.di-tokens'
import { CreateWalletCommand } from './create-wallet.command'

@CommandHandler(CreateWalletCommand)
export class CreateWalletService implements ICommandHandler<
    CreateWalletCommand,
    AggregateID
> {
    constructor(
        @Inject(WALLET_REPOSITORY)
        private readonly _walletRepository: WalletRepositoryPort,
    ) {}

    async execute(command: CreateWalletCommand): Promise<AggregateID> {
        const existingWallet = await this._walletRepository.findOne({
            id: command.userId,
        })

        if (existingWallet) {
            new WalletAlreadyExistsError()
        }

        const wallet = WalletEntity.create({ userId: command.userId })
        await this._walletRepository.save(wallet)
        return wallet.id
    }
}
