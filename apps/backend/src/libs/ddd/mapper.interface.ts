import { Entity } from './entity.base'

export interface Mapper<DomainEntity extends Entity<unknown>, DbRecord> {
    toPersistence(entity: DomainEntity): DbRecord
    toDomain(record: unknown): DomainEntity
}
