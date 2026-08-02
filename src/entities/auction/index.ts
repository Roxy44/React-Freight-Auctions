export {
    auctionTypeSchema,
    auctionStatusSchema,
    auctionListRequestSchema,
    auctionListResponseSchema,
    auctionDetailSchema,
    auctionBetsResponseSchema,
    placeBetRequestSchema,
    placeBetResponseSchema,
    type AuctionType,
    type AuctionStatus,
    type UserTradingStatus,
    type PrimaryAction,
    type AuctionListRequest,
    type AuctionListItem,
    type AuctionListResponse,
    type AuctionDetail,
    type BetItem,
    type AuctionBetsResponse,
    type PlaceBetRequest,
    type PlaceBetResponse,
} from '@/entities/auction/model/schemas';

export { auctionQueryKeys } from '@/entities/auction/model/query-keys';

export {
    fetchAuctionList,
    fetchAuctionDetail,
    fetchAuctionBets,
    placeAuctionBet,
} from '@/entities/auction/api/auctions-api';

export {
    useAuctionListQuery,
    useAuctionDetailQuery,
    useAuctionBetsQuery,
    usePlaceBetMutation,
    usePrefetchAuctionDetail,
} from '@/entities/auction/api/auction-queries';

export {
    parseAuctionsSearchParams,
    toAuctionListRequest,
    toAuctionsSearchNavigate,
    mapStatusesToListRequest,
    DEFAULT_AUCTIONS_SEARCH,
    type AuctionsSearchParams,
} from '@/entities/auction/lib/search-params';

export { mapAuctionToListItem, resolvePrimaryAction } from '@/entities/auction/lib/mappers';
export { buildBetSchema, type BetFormValues } from '@/entities/auction/lib/bet-schema';
