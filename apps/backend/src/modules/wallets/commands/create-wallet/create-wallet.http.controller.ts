/* eslint-disable @typescript-eslint/naming-convention */
import { IdResponse } from '@libs/api/id.response.dto'
import { AggregateID } from '@libs/ddd'
import {
    Body,
    ConflictException as ConflictHttpException,
    Controller,
    Post,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { match, Result } from 'oxide.ts'

import { WalletAlreadyExistsError } from '../../domain'
import { CreateWalletCommand } from './create-wallet.command'
import { CreateWalletRequestDto } from './create-wallet.request.dto'

@Controller('wallets')
export class CreateWalletHttpController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: 'Create wallet' })
    @ApiResponse({ status: 200, type: IdResponse })
    @Post()
    async create(@Body() body: CreateWalletRequestDto): Promise<IdResponse> {
        const command = new CreateWalletCommand(body)
        const result: Result<AggregateID, WalletAlreadyExistsError> =
            await this._commandBus.execute(command)

        return match(result, {
            Ok: (id: string) => new IdResponse(id),
            Err: (error: Error) => {
                if (error instanceof WalletAlreadyExistsError)
                    throw new ConflictHttpException(error.message)
                throw error
            },
        })
    }
}
