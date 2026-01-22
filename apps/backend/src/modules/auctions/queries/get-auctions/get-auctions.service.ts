import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { AUCTION_REPOSITORY } from '../../auction.di-tokens'
import { AuctionMapper } from '../../auction.mapper'
import type { AuctionRepositoryPort } from '../../database'
import { AuctionResponseDto } from '../../dtos'
import { GetAuctionsQuery } from './get-auctions.query'

@QueryHandler(GetAuctionsQuery)
export class GetAuctionsService implements IQueryHandler<
    GetAuctionsQuery,
    AuctionResponseDto[]
> {
    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
        private readonly _mapper: AuctionMapper,
    ) {}

    async execute(query: GetAuctionsQuery): Promise<AuctionResponseDto[]> {
        const auctions = await this._auctionRepository.findMany({
            ids: query.ids,
            statuses: query.statuses,
            currentRoundNumbers: query.currentRoundNumbers,
        })

        return auctions.map((auction) => this._mapper.toResponse(auction))
    }
}
