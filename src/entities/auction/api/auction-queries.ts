import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    fetchAuctionBets,
    fetchAuctionDetail,
    fetchAuctionList,
    placeAuctionBet,
} from '@/entities/auction/api/auctions-api';
import { auctionQueryKeys } from '@/entities/auction/model/query-keys';
import type { AuctionListRequest, PlaceBetRequest } from '@/entities/auction/model/schemas';

export function useAuctionListQuery(params: AuctionListRequest) {
    return useQuery({
        queryKey: auctionQueryKeys.list(params),
        queryFn: ({ signal }) => fetchAuctionList(params, signal),
    });
}

export function useAuctionDetailQuery(auctionUuid: string) {
    return useQuery({
        queryKey: auctionQueryKeys.detail(auctionUuid),
        queryFn: ({ signal }) => fetchAuctionDetail(auctionUuid, signal),
        enabled: Boolean(auctionUuid),
    });
}

export function useAuctionBetsQuery(auctionUuid: string) {
    return useQuery({
        queryKey: auctionQueryKeys.bets(auctionUuid),
        queryFn: ({ signal }) => fetchAuctionBets(auctionUuid, signal),
        enabled: Boolean(auctionUuid),
    });
}

export function usePlaceBetMutation(auctionUuid: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: PlaceBetRequest) => placeAuctionBet(auctionUuid, body),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() }),
                queryClient.invalidateQueries({ queryKey: auctionQueryKeys.detail(auctionUuid) }),
                queryClient.invalidateQueries({ queryKey: auctionQueryKeys.bets(auctionUuid) }),
            ]);
        },
    });
}

export function usePrefetchAuctionDetail() {
    const queryClient = useQueryClient();

    return (auctionUuid: string) => {
        void queryClient.prefetchQuery({
            queryKey: auctionQueryKeys.detail(auctionUuid),
            queryFn: ({ signal }) => fetchAuctionDetail(auctionUuid, signal),
        });
    };
}
