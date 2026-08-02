import { resolvePrimaryAction } from '@/entities/auction/lib/mappers';
import type {
    AuctionBetsResponse,
    AuctionDetail,
    AuctionListRequest,
    AuctionListResponse,
    BetItem,
    PlaceBetRequest,
    PlaceBetResponse,
} from '@/entities/auction/model/schemas';
import { getCityName } from '@/shared/config/cities';
import {
    CURRENT_CARRIER_NAME,
    createInitialAuctions,
    toListItem,
    type AuctionRecord,
} from '@/shared/api/msw/fixtures';

type ValidationIssue = {
    field: string;
    code: string;
    message: string;
};

export class StoreValidationError extends Error {
    readonly errors: ValidationIssue[];

    constructor(errors: ValidationIssue[]) {
        super('Validation failed');
        this.name = 'StoreValidationError';
        this.errors = errors;
    }
}

export class StoreNotFoundError extends Error {
    constructor(message = 'Auction not found') {
        super(message);
        this.name = 'StoreNotFoundError';
    }
}

export class StoreForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'StoreForbiddenError';
    }
}

let auctions: AuctionRecord[] = createInitialAuctions();

export function resetAuctionStore(): void {
    auctions = createInitialAuctions();
}

function findRecord(auctionUuid: string): AuctionRecord {
    const record = auctions.find((item) => item.detail.uuid === auctionUuid);
    if (!record) {
        throw new StoreNotFoundError();
    }
    return record;
}

function matchesCity(filter: string | null | undefined, city: string): boolean {
    if (!filter) {
        return true;
    }
    const normalizedFilter = getCityName(filter).toLowerCase();
    return city.toLowerCase() === normalizedFilter || city.toLowerCase().includes(normalizedFilter);
}

function matchesDateRange(
    value: string | null | undefined,
    from: string | null | undefined,
    to: string | null | undefined,
): boolean {
    if (!value) {
        return !from && !to;
    }
    const day = value.slice(0, 10);
    if (from && day < from) {
        return false;
    }
    if (to && day > to) {
        return false;
    }
    return true;
}

function applyFilters(items: AuctionRecord[], params: AuctionListRequest): AuctionRecord[] {
    return items.filter((record) => {
        const item = toListItem(record);
        const { detail } = record;

        if (params.cargo_num && !detail.cargo_num.toLowerCase().includes(params.cargo_num.toLowerCase())) {
            return false;
        }

        if (params.status && detail.status !== params.status) {
            return false;
        }

        if (params.statuses?.length && !params.statuses.includes(detail.status)) {
            return false;
        }

        if (params.auc_type && detail.auc_type !== params.auc_type) {
            return false;
        }

        if (!matchesCity(params.load_city, item.route.load_city)) {
            return false;
        }

        if (!matchesCity(params.unload_city, item.route.unload_city)) {
            return false;
        }

        if (!matchesDateRange(detail.load_date, params.load_date_from, params.load_date_to)) {
            return false;
        }

        if (params.is_available != null) {
            const available = detail.status === 'Active' && detail.trading.can_set_bet;
            if (available !== params.is_available) {
                return false;
            }
        }

        if (params.is_bidder != null && detail.my_bet.has_bet !== params.is_bidder) {
            return false;
        }

        const price = item.pricing.current_price;
        if (params.price_from != null && (price == null || price < params.price_from)) {
            return false;
        }
        if (params.price_to != null && (price == null || price > params.price_to)) {
            return false;
        }

        return true;
    });
}

export function listAuctions(params: AuctionListRequest): AuctionListResponse {
    const filtered = applyFilters(auctions, params);
    const start = (params.page - 1) * params.page_size;
    const pageItems = filtered.slice(start, start + params.page_size);

    return {
        items: pageItems.map(toListItem),
        total: filtered.length,
        page: params.page,
        page_size: params.page_size,
    };
}

export function getAuction(auctionUuid: string): AuctionDetail {
    const record = findRecord(auctionUuid);
    const detail = structuredClone(record.detail);

    if (detail.trading.no_view_cargo_price) {
        detail.pricing = {
            ...detail.pricing,
            current_price: null,
            available_price: null,
            price_per_km: null,
        };
    }

    if (detail.trading.hide_points_address_and_contacts) {
        detail.contacts = null;
        detail.route = {
            ...detail.route,
            points: detail.route.points.map((point) => ({ ...point, address: null })),
        };
    }

    return detail;
}

export function listBets(auctionUuid: string): AuctionBetsResponse {
    const record = findRecord(auctionUuid);

    if (record.detail.trading.hide_bets_history) {
        return {
            is_hidden: true,
            participants_count: record.detail.trading.participants_count ?? 0,
            items: [],
        };
    }

    return {
        is_hidden: false,
        participants_count: record.detail.trading.participants_count ?? 0,
        items: structuredClone(record.bets),
    };
}

function assertBetPrice(detail: AuctionDetail, price: number): void {
    const errors: ValidationIssue[] = [];

    if (!(price > 0)) {
        errors.push({ field: 'price', code: 'too_small', message: 'Цена должна быть больше 0' });
    }

    const { min, max, step } = detail.pricing;

    if (min != null && price < min) {
        errors.push({ field: 'price', code: 'too_small', message: `Минимальная цена: ${min}` });
    }

    if (max != null && price > max) {
        errors.push({ field: 'price', code: 'too_big', message: `Максимальная цена: ${max}` });
    }

    if (step != null && step > 0 && min != null) {
        const delta = price - min;
        const steps = delta / step;
        if (Math.abs(steps - Math.round(steps)) > 1e-8) {
            errors.push({
                field: 'price',
                code: 'not_multiple_of',
                message: `Цена должна быть кратна шагу ${step}`,
            });
        }
    }

    if (errors.length) {
        throw new StoreValidationError(errors);
    }
}

function recomputeRanks(bets: BetItem[], aucType: AuctionDetail['auc_type']): void {
    const active = bets.filter((bet) => !bet.is_cancelled);
    const sorted = [...active].sort((a, b) => {
        const left = a.price_with_vat ?? 0;
        const right = b.price_with_vat ?? 0;
        if (aucType === 'Up') {
            return right - left;
        }
        return left - right;
    });

    sorted.forEach((bet, index) => {
        bet.rank = index + 1;
        bet.is_winner = index === 0;
    });

    for (const bet of bets) {
        if (bet.is_cancelled) {
            bet.rank = null;
            bet.is_winner = false;
        }
    }
}

export function placeBet(auctionUuid: string, body: PlaceBetRequest): PlaceBetResponse {
    const record = findRecord(auctionUuid);
    const { detail } = record;

    if (!detail.trading.can_set_bet) {
        throw new StoreForbiddenError('Ставка недоступна для этого аукциона');
    }

    assertBetPrice(detail, body.price);

    const priceWithVat = body.price;
    const priceWithoutVat = Math.round((priceWithVat / 1.2) * 100) / 100;
    const now = new Date().toISOString();

    let myBet = record.bets.find((bet) => bet.is_mine && !bet.is_cancelled);

    if (myBet) {
        myBet.price_with_vat = priceWithVat;
        myBet.price_without_vat = priceWithoutVat;
        myBet.placed_at = now;
        myBet.is_cancelled = false;
        myBet.cancel_reason = null;
    } else {
        myBet = {
            uuid: crypto.randomUUID(),
            carrier_name: CURRENT_CARRIER_NAME,
            is_mine: true,
            rank: null,
            price_with_vat: priceWithVat,
            price_without_vat: priceWithoutVat,
            is_winner: false,
            is_cancelled: false,
            cancel_reason: null,
            placed_at: now,
        };
        record.bets.push(myBet);
    }

    recomputeRanks(record.bets, detail.auc_type);

    const mine = record.bets.find((bet) => bet.is_mine && !bet.is_cancelled)!;
    const leadingPrice = record.bets.find((bet) => bet.rank === 1 && !bet.is_cancelled)?.price_with_vat ?? priceWithVat;

    detail.pricing.current_price = leadingPrice;
    if (detail.auc_type === 'Down' && detail.pricing.step) {
        detail.pricing.available_price = leadingPrice - detail.pricing.step;
    } else if (detail.auc_type === 'Up' && detail.pricing.step) {
        detail.pricing.available_price = leadingPrice + detail.pricing.step;
    } else {
        detail.pricing.available_price = leadingPrice;
    }

    if (detail.route.distance_km) {
        detail.pricing.price_per_km = Math.round(leadingPrice / detail.route.distance_km);
    }

    detail.my_bet = {
        has_bet: true,
        price: priceWithVat,
        price_with_vat: priceWithVat,
        price_without_vat: priceWithoutVat,
        rank: mine.rank ?? null,
        is_winner: mine.is_winner,
        is_cancelled: false,
        cancel_reason: null,
        placed_at: now,
    };
    detail.has_my_bet = true;
    detail.user_trading_status = mine.is_winner ? 'Leading' : 'Losing';
    detail.trading.participants_count = new Set(
        record.bets.filter((bet) => !bet.is_cancelled).map((bet) => bet.carrier_name),
    ).size;
    detail.primary_action = resolvePrimaryAction(detail);

    return {
        bet: structuredClone(mine),
        auction: {
            uuid: detail.uuid,
            pricing: structuredClone(detail.pricing),
            user_trading_status: detail.user_trading_status ?? null,
            my_bet: structuredClone(detail.my_bet),
            has_my_bet: true,
            primary_action: detail.primary_action,
        },
    };
}
