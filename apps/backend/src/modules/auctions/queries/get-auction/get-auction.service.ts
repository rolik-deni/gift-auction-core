import { Inject } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'

import { AUCTION_REPOSITORY } from '../../auction.di-tokens'
import { AuctionMapper } from '../../auction.mapper'
import type { AuctionRepositoryPort } from '../../database'
import { AuctionResponseDto } from '../../dtos'
import { GetAuctionQuery } from './get-auction.query'

@QueryHandler(GetAuctionQuery)
export class GetAuctionService implements IQueryHandler<
    GetAuctionQuery,
    AuctionResponseDto
> {
    constructor(
        @Inject(AUCTION_REPOSITORY)
        private readonly _auctionRepository: AuctionRepositoryPort,
        private readonly _mapper: AuctionMapper,
    ) {}

    async execute(query: GetAuctionQuery): Promise<AuctionResponseDto> {
        const auction = await this._auctionRepository.findOne(
            { id: query.auctionId },
            true,
        )

        return this._mapper.toResponse(auction)
    }
}
