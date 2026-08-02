import { http } from '@/shared/api/http';
import {
    auctionBetsResponseSchema,
    auctionDetailSchema,
    auctionListResponseSchema,
    placeBetResponseSchema,
    type AuctionListRequest,
    type AuctionListResponse,
    type AuctionDetail,
    type AuctionBetsResponse,
    type PlaceBetRequest,
    type PlaceBetResponse,
} from '@/entities/auction/model/schemas';

function parseOrThrow<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
    return schema.parse(data);
}

export async function fetchAuctionList(params: AuctionListRequest, signal?: AbortSignal): Promise<AuctionListResponse> {
    const data = await http<unknown>('/auctions/list', { method: 'POST', body: params, signal });
    return parseOrThrow(auctionListResponseSchema, data);
}

export async function fetchAuctionDetail(auctionUuid: string, signal?: AbortSignal): Promise<AuctionDetail> {
    const data = await http<unknown>(`/auctions/${auctionUuid}`, { signal });
    return parseOrThrow(auctionDetailSchema, data);
}

export async function fetchAuctionBets(auctionUuid: string, signal?: AbortSignal): Promise<AuctionBetsResponse> {
    const data = await http<unknown>(`/auctions/${auctionUuid}/bets`, { signal });
    return parseOrThrow(auctionBetsResponseSchema, data);
}

export async function placeAuctionBet(
    auctionUuid: string,
    body: PlaceBetRequest,
    signal?: AbortSignal,
): Promise<PlaceBetResponse> {
    const data = await http<unknown>(`/auctions/${auctionUuid}/bets`, {
        method: 'POST',
        body,
        signal,
    });
    return parseOrThrow(placeBetResponseSchema, data);
}
