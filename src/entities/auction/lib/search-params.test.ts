import { describe, expect, it } from 'vitest';

import {
    mapStatusesToListRequest,
    parseAuctionsSearchParams,
    toAuctionListRequest,
    toAuctionsSearchNavigate,
} from '@/entities/auction/lib/search-params';

describe('auctions search params', () => {
    it('applies safe fallbacks for invalid values', () => {
        const parsed = parseAuctionsSearchParams({
            page: 'abc',
            page_size: 999,
            status: 'Nope',
            is_bidder: 'true',
            statuses: 'Active,Finished',
        });

        expect(parsed.page).toBe(1);
        expect(parsed.page_size).toBe(100);
        expect(parsed.status).toBeUndefined();
        expect(parsed.is_bidder).toBe(true);
        expect(parsed.statuses).toEqual(['Active', 'Finished']);
    });

    it('builds list request with nulls for empty filters', () => {
        const request = toAuctionListRequest(parseAuctionsSearchParams({ page: 2, cargo_num: 'CRG' }));
        expect(request.page).toBe(2);
        expect(request.cargo_num).toBe('CRG');
        expect(request.status).toBeNull();
        expect(request.statuses).toBeNull();
    });

    it('maps one status to status and many to statuses', () => {
        expect(mapStatusesToListRequest(['Active'])).toEqual({ status: 'Active', statuses: null });
        expect(mapStatusesToListRequest(['Active', 'Finished'])).toEqual({
            status: null,
            statuses: ['Active', 'Finished'],
        });
        expect(mapStatusesToListRequest([])).toEqual({ status: null, statuses: null });
    });

    it('sends status key when a single value is selected in URL statuses', () => {
        const request = toAuctionListRequest(parseAuctionsSearchParams({ statuses: ['Waiting'] }));
        expect(request.status).toBe('Waiting');
        expect(request.statuses).toBeNull();
    });

    it('writes status or statuses into the URL the same way as the API', () => {
        const one = toAuctionsSearchNavigate({ statuses: ['Active'] });
        expect(one.status).toBe('Active');
        expect(one.statuses).toBeUndefined();

        const many = toAuctionsSearchNavigate({ statuses: ['Active', 'Finished'] });
        expect(many.status).toBeUndefined();
        expect(many.statuses).toEqual(['Active', 'Finished']);
    });
});
