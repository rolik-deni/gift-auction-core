import { AggregateID } from '@libs/ddd'
import { getLogContext, inspectInline } from '@libs/utils'
import { Inject, Logger } from '@nestjs/common'
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
    private readonly _logger = new Logger()
    private readonly _getLogContext = getLogContext.bind(
        this,
        CreateWalletService.name,
    )

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

        this._logger.log(
            `Wallet created (${inspectInline({
                id: wallet.id,
                userId: command.userId,
            })})`,
            this._getLogContext(this.execute.name),
        )

        return wallet.id
    }
}
