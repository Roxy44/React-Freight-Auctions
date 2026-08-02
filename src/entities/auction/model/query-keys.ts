import type { AuctionListRequest } from '@/entities/auction/model/schemas';

export const auctionQueryKeys = {
    all: ['auctions'] as const,
    lists: () => [...auctionQueryKeys.all, 'list'] as const,
    /** Filters + pagination from URL enter the key so reload restores the same query cache entry. */
    list: (params: AuctionListRequest) => [...auctionQueryKeys.lists(), params] as const,
    details: () => [...auctionQueryKeys.all, 'detail'] as const,
    detail: (auctionUuid: string) => [...auctionQueryKeys.details(), auctionUuid] as const,
    bets: (auctionUuid: string) => [...auctionQueryKeys.all, 'bets', auctionUuid] as const,
};
