import { describe, expect, it } from 'vitest';

import { mapAuctionToListItem, resolvePrimaryAction } from '@/entities/auction/lib/mappers';
import type { AuctionDetail } from '@/entities/auction/model/schemas';

function baseDetail(overrides: Partial<AuctionDetail> = {}): AuctionDetail {
    return {
        uuid: '00000000-0000-4000-8000-000000000099',
        cargo_num: 'CRG-TEST',
        auc_type: 'Down',
        status: 'Active',
        user_trading_status: null,
        organizer: { name: 'Org' },
        contacts: null,
        route: {
            load_city: 'Москва',
            unload_city: 'Казань',
            distance_km: 800,
            points: [
                { type: 'load', city: 'Москва', address: 'A', order: 0 },
                { type: 'unload', city: 'Казань', address: 'B', order: 1 },
            ],
        },
        cargo: { name: 'Груз', weight_kg: 1000, volume_m3: 10, body_type: 'тент' },
        payment: { type: 'безналичный' },
        trading: {
            can_set_bet: true,
            hide_bets_history: false,
            hide_points_address_and_contacts: false,
            no_view_cargo_price: false,
        },
        pricing: {
            current_price: 100_000,
            available_price: 99_000,
            price_per_km: 125,
            step: 1_000,
            currency: 'RUB',
        },
        my_bet: { has_bet: false },
        primary_action: 'place_bet',
        has_my_bet: false,
        ...overrides,
    };
}

describe('auction ViewModel mappers', () => {
    it('maps detail to list item fields', () => {
        const item = mapAuctionToListItem(baseDetail());
        expect(item.cargo_num).toBe('CRG-TEST');
        expect(item.route.load_city).toBe('Москва');
        expect(item.pricing.current_price).toBe(100_000);
        expect(item.primary_action).toBe('place_bet');
        expect(item.is_available).toBe(true);
    });

    it('hides price on list item when no_view_cargo_price is set', () => {
        const item = mapAuctionToListItem(
            baseDetail({
                trading: {
                    can_set_bet: false,
                    hide_bets_history: false,
                    hide_points_address_and_contacts: false,
                    no_view_cargo_price: true,
                },
                my_bet: { has_bet: true },
                has_my_bet: true,
            }),
        );

        expect(item.pricing.current_price).toBeNull();
        expect(item.pricing.price_per_km).toBeNull();
        expect(item.primary_action).toBe('view_bets');
    });

    it('resolves primary actions', () => {
        expect(resolvePrimaryAction(baseDetail({ trading: { ...baseDetail().trading, can_set_bet: false } }))).toBe(
            'disabled',
        );
        expect(
            resolvePrimaryAction(
                baseDetail({
                    my_bet: { has_bet: true },
                    has_my_bet: true,
                }),
            ),
        ).toBe('edit_bet');
    });
});
