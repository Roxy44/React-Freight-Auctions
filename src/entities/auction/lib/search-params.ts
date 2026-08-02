import { z } from 'zod';

import {
    auctionStatusSchema,
    auctionTypeSchema,
    type AuctionListRequest,
    type AuctionStatus,
} from '@/entities/auction/model/schemas';

const emptyToUndefined = (value: unknown) => {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }
    return value;
};

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const optionalBoolean = z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }
    if (value === true || value === 'true' || value === '1') {
        return true;
    }
    if (value === false || value === 'false' || value === '0') {
        return false;
    }
    return undefined;
}, z.boolean().optional());

const optionalNumber = z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}, z.number().optional());

const optionalStatus = z.preprocess((value) => {
    const cleaned = emptyToUndefined(value);
    if (cleaned === undefined) {
        return undefined;
    }
    const parsed = auctionStatusSchema.safeParse(cleaned);
    return parsed.success ? parsed.data : undefined;
}, auctionStatusSchema.optional());

const optionalType = z.preprocess((value) => {
    const cleaned = emptyToUndefined(value);
    if (cleaned === undefined) {
        return undefined;
    }
    const parsed = auctionTypeSchema.safeParse(cleaned);
    return parsed.success ? parsed.data : undefined;
}, auctionTypeSchema.optional());

const optionalStatuses = z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }
    const raw = Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? value
                .split(',')
                .map((part) => part.trim())
                .filter(Boolean)
          : [];
    const statuses = raw
        .map((item) => auctionStatusSchema.safeParse(item))
        .filter((result) => result.success)
        .map((result) => result.data);
    return statuses.length ? statuses : undefined;
}, z.array(auctionStatusSchema).optional());

/**
 * URL search params for the auctions list.
 * Invalid values fall back to safe defaults (assignment requirement).
 */
export const auctionsSearchParamsSchema = z.object({
    page: z.preprocess((value) => {
        const n = Number(value ?? 1);
        return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
    }, z.number().int().min(1)),
    page_size: z.preprocess((value) => {
        const n = Number(value ?? 10);
        if (!Number.isFinite(n)) {
            return 10;
        }
        return Math.min(100, Math.max(1, Math.floor(n)));
    }, z.number().int().min(1).max(100)),
    cargo_num: optionalString,
    /** Legacy/single URL key — normalized into UI multi-select via resolveSelectedStatuses. */
    status: optionalStatus,
    statuses: optionalStatuses,
    auc_type: optionalType,
    load_city: optionalString,
    unload_city: optionalString,
    load_date_from: optionalString,
    load_date_to: optionalString,
    is_available: optionalBoolean,
    is_bidder: optionalBoolean,
    price_from: optionalNumber,
    price_to: optionalNumber,
});

export type AuctionsSearchParams = z.infer<typeof auctionsSearchParamsSchema>;

export const DEFAULT_AUCTIONS_SEARCH: AuctionsSearchParams = {
    page: 1,
    page_size: 10,
};

export function parseAuctionsSearchParams(input: unknown): AuctionsSearchParams {
    const result = auctionsSearchParamsSchema.safeParse(input ?? {});
    return result.success ? result.data : { ...DEFAULT_AUCTIONS_SEARCH };
}

/** Merge status + statuses for the single multi-select control. */
export function resolveSelectedStatuses(search: AuctionsSearchParams): AuctionStatus[] {
    const selected = [...(search.statuses ?? [])];
    if (search.status && !selected.includes(search.status)) {
        selected.push(search.status);
    }
    return selected;
}

/**
 * 0 selected → neither key;
 * 1 → `status`;
 * 2+ → `statuses`.
 */
export function mapStatusesToListRequest(selected: AuctionStatus[]): {
    status: AuctionStatus | null;
    statuses: AuctionStatus[] | null;
} {
    if (selected.length === 1) {
        return { status: selected[0]!, statuses: null };
    }
    if (selected.length > 1) {
        return { status: null, statuses: selected };
    }
    return { status: null, statuses: null };
}

export function toAuctionListRequest(search: AuctionsSearchParams): AuctionListRequest {
    const { status, statuses } = mapStatusesToListRequest(resolveSelectedStatuses(search));

    return {
        page: search.page,
        page_size: search.page_size,
        cargo_num: search.cargo_num ?? null,
        status,
        statuses,
        auc_type: search.auc_type ?? null,
        load_city: search.load_city ?? null,
        unload_city: search.unload_city ?? null,
        load_date_from: search.load_date_from ?? null,
        load_date_to: search.load_date_to ?? null,
        is_available: search.is_available ?? null,
        is_bidder: search.is_bidder ?? null,
        price_from: search.price_from ?? null,
        price_to: search.price_to ?? null,
    };
}

/** Drop defaults/empty so the URL stays clean. Mirror API: 1 → status, 2+ → statuses. */
export function toAuctionsSearchNavigate(values: Partial<AuctionsSearchParams>): AuctionsSearchParams {
    const merged = parseAuctionsSearchParams({ ...DEFAULT_AUCTIONS_SEARCH, ...values });
    const { status, statuses } = mapStatusesToListRequest(resolveSelectedStatuses(merged));

    const cleaned: AuctionsSearchParams = {
        page: merged.page,
        page_size: merged.page_size,
    };

    if (merged.cargo_num) cleaned.cargo_num = merged.cargo_num;
    if (status) cleaned.status = status;
    if (statuses?.length) cleaned.statuses = statuses;
    if (merged.auc_type) cleaned.auc_type = merged.auc_type;
    if (merged.load_city) cleaned.load_city = merged.load_city;
    if (merged.unload_city) cleaned.unload_city = merged.unload_city;
    if (merged.load_date_from) cleaned.load_date_from = merged.load_date_from;
    if (merged.load_date_to) cleaned.load_date_to = merged.load_date_to;
    if (merged.is_available != null) cleaned.is_available = merged.is_available;
    if (merged.is_bidder != null) cleaned.is_bidder = merged.is_bidder;
    if (merged.price_from != null) cleaned.price_from = merged.price_from;
    if (merged.price_to != null) cleaned.price_to = merged.price_to;

    return cleaned;
}
