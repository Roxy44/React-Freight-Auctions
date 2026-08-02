import type { AuctionDetail, AuctionListItem, PrimaryAction } from '@/entities/auction/model/schemas';

export function resolvePrimaryAction(detail: AuctionDetail): PrimaryAction {
    if (!detail.trading.can_set_bet && detail.my_bet.has_bet) {
        return 'view_bets';
    }
    if (!detail.trading.can_set_bet) {
        return 'disabled';
    }
    if (detail.my_bet.has_bet) {
        return 'edit_bet';
    }
    return 'place_bet';
}

/** ViewModel mapper: detail DTO → list card model (respects no_view_cargo_price). */
export function mapAuctionToListItem(detail: AuctionDetail): AuctionListItem {
    const load = detail.route.points.find((point) => point.type === 'load');
    const unload = detail.route.points.find((point) => point.type === 'unload');

    return {
        uuid: detail.uuid,
        cargo_num: detail.cargo_num,
        auc_type: detail.auc_type,
        status: detail.status,
        user_trading_status: detail.user_trading_status ?? null,
        route: {
            load_city: detail.route.load_city ?? load?.city ?? '',
            unload_city: detail.route.unload_city ?? unload?.city ?? '',
            distance_km: detail.route.distance_km ?? null,
        },
        load_date: detail.load_date ?? null,
        unload_date: detail.unload_date ?? null,
        cargo: {
            name: detail.cargo.name,
            weight_kg: detail.cargo.weight_kg ?? null,
            volume_m3: detail.cargo.volume_m3 ?? null,
            body_type: detail.cargo.body_type ?? null,
        },
        pricing: {
            current_price: detail.trading.no_view_cargo_price ? null : (detail.pricing.current_price ?? null),
            price_per_km: detail.trading.no_view_cargo_price ? null : (detail.pricing.price_per_km ?? null),
            bet_step: detail.pricing.step ?? null,
            currency: detail.pricing.currency ?? 'RUB',
        },
        has_my_bet: detail.my_bet.has_bet,
        primary_action: resolvePrimaryAction(detail),
        is_available: detail.status === 'Active' && detail.trading.can_set_bet,
    };
}
