import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'

import { BotsService } from './bots.service'

@Module({
    imports: [CqrsModule],
    providers: [BotsService],
})
export class BotsModule {}
