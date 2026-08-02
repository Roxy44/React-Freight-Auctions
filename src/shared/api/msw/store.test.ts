import { describe, expect, it, beforeEach } from 'vitest';

import {
    StoreValidationError,
    getAuction,
    listAuctions,
    listBets,
    placeBet,
    resetAuctionStore,
} from '@/shared/api/msw/store';

describe('auction MSW store', () => {
    beforeEach(() => {
        resetAuctionStore();
    });

    it('filters list by cargo_num and is_bidder', () => {
        const byCargo = listAuctions({ page: 1, page_size: 20, cargo_num: '10021' });
        expect(byCargo.total).toBe(1);
        expect(byCargo.items[0]?.cargo_num).toBe('CRG-10021');

        const myBets = listAuctions({ page: 1, page_size: 20, is_bidder: true });
        expect(myBets.items.every((item) => item.has_my_bet)).toBe(true);
        expect(myBets.total).toBeGreaterThan(0);
    });

    it('hides bets history when flag is set', () => {
        const auction = listAuctions({ page: 1, page_size: 20, cargo_num: '10077' }).items[0];
        expect(auction).toBeDefined();
        const bets = listBets(auction!.uuid);
        expect(bets.is_hidden).toBe(true);
        expect(bets.items).toHaveLength(0);
    });

    it('places bet and updates current price / my bet', () => {
        const auction = listAuctions({ page: 1, page_size: 20, cargo_num: '10045' }).items[0];
        expect(auction).toBeDefined();

        const result = placeBet(auction!.uuid, { price: 114_000 });
        expect(result.bet.is_mine).toBe(true);
        expect(result.auction?.has_my_bet).toBe(true);

        const detail = getAuction(auction!.uuid);
        expect(detail.my_bet.has_bet).toBe(true);
        expect(detail.pricing.current_price).toBeTruthy();
        expect(detail.has_my_bet).toBe(true);
    });

    it('rejects bet below min with validation error', () => {
        const auction = listAuctions({ page: 1, page_size: 20, cargo_num: '10045' }).items[0];
        expect(() => placeBet(auction!.uuid, { price: 1_000 })).toThrow(StoreValidationError);
    });

    it('excludes lots with hidden or missing price from price range filters', () => {
        const fromOnly = listAuctions({ page: 1, page_size: 20, price_from: 100_000 });
        expect(fromOnly.items.every((item) => item.pricing.current_price != null)).toBe(true);
        expect(fromOnly.items.every((item) => (item.pricing.current_price ?? 0) >= 100_000)).toBe(true);
        expect(fromOnly.items.some((item) => item.cargo_num === 'CRG-10155')).toBe(false);
        expect(fromOnly.items.some((item) => item.cargo_num === 'CRG-10102')).toBe(false);

        const toOnly = listAuctions({ page: 1, page_size: 20, price_to: 200_000 });
        expect(toOnly.items.every((item) => item.pricing.current_price != null)).toBe(true);
        expect(toOnly.items.some((item) => item.cargo_num === 'CRG-10155')).toBe(false);
    });

    it('paginates list results', () => {
        const page1 = listAuctions({ page: 1, page_size: 5 });
        const page2 = listAuctions({ page: 2, page_size: 5 });

        expect(page1.total).toBeGreaterThanOrEqual(16);
        expect(page1.items).toHaveLength(5);
        expect(page2.items).toHaveLength(5);
        expect(page1.items[0]?.uuid).not.toBe(page2.items[0]?.uuid);
        expect(page1.page).toBe(1);
        expect(page2.page).toBe(2);
    });
});
