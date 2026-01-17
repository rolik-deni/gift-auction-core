import { EventEmitter2 } from '@nestjs/event-emitter'

import { LoggerPort } from '../ports/logger.port'
import { getLogContext } from '../utils'
import { DomainEvent } from './domain-event.base'
import { Entity } from './entity.base'

export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
    private _domainEvents: DomainEvent[] = []

    get domainEvents(): DomainEvent[] {
        return this._domainEvents
    }

    protected addEvent(domainEvent: DomainEvent): void {
        this._domainEvents.push(domainEvent)
    }

    clearEvents(): void {
        this._domainEvents = []
    }

    async publishEvents(
        logger: LoggerPort,
        eventEmitter: EventEmitter2,
    ): Promise<void> {
        await Promise.all(
            this.domainEvents.map(async (event): Promise<void> => {
                logger.debug(
                    `Event published for aggregate ${this.constructor.name}: ${
                        this.id
                    }`,
                    getLogContext(AggregateRoot.name, this.publishEvents.name),
                )
                await eventEmitter.emitAsync(event.constructor.name, event)
            }),
        )
        this.clearEvents()
    }
}
