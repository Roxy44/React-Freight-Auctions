import { mapAuctionToListItem, resolvePrimaryAction } from '@/entities/auction/lib/mappers';
import type {
    AuctionDetail,
    AuctionListItem,
    AuctionStatus,
    AuctionType,
    BetItem,
    UserTradingStatus,
} from '@/entities/auction/model/schemas';

export const CURRENT_CARRIER_NAME = 'ООО «Быстрый Рейс»';

export type AuctionRecord = {
    detail: AuctionDetail;
    bets: BetItem[];
};

function uuid(n: string): string {
    return `00000000-0000-4000-8000-${n.padStart(12, '0')}`;
}

export function toListItem(record: AuctionRecord): AuctionListItem {
    return mapAuctionToListItem(record.detail);
}

function baseTrading(overrides: Partial<AuctionDetail['trading']> = {}): AuctionDetail['trading'] {
    return {
        can_set_bet: true,
        hide_bets_history: false,
        hide_points_address_and_contacts: false,
        no_view_cargo_price: false,
        starts_at: '2026-07-20T09:00:00.000Z',
        ends_at: '2026-08-10T18:00:00.000Z',
        participants_count: 0,
        ...overrides,
    };
}

function makeDetail(input: {
    id: string;
    cargo_num: string;
    auc_type: AuctionType;
    status: AuctionStatus;
    loadCity: string;
    unloadCity: string;
    loadAddress?: string;
    unloadAddress?: string;
    distance_km: number;
    load_date: string;
    unload_date: string;
    cargo: AuctionDetail['cargo'];
    pricing: AuctionDetail['pricing'];
    trading?: Partial<AuctionDetail['trading']>;
    user_trading_status?: UserTradingStatus;
    my_bet?: AuctionDetail['my_bet'];
    organizer?: AuctionDetail['organizer'];
}): AuctionDetail {
    const trading = baseTrading(input.trading);
    const hideContacts = trading.hide_points_address_and_contacts;
    const my_bet = input.my_bet ?? { has_bet: false };

    const detail: AuctionDetail = {
        uuid: uuid(input.id),
        cargo_num: input.cargo_num,
        auc_type: input.auc_type,
        status: input.status,
        user_trading_status: input.user_trading_status ?? null,
        organizer: input.organizer ?? {
            name: 'АО «СеверТранс»',
            inn: '7701234567',
            rating: 4.7,
        },
        contacts: hideContacts
            ? null
            : {
                  phone: '+7 (495) 111-22-33',
                  email: 'logistics@severtrans.example',
                  person_name: 'Ирина Ковалёва',
              },
        route: {
            load_city: input.loadCity,
            unload_city: input.unloadCity,
            distance_km: input.distance_km,
            points: [
                {
                    type: 'load',
                    city: input.loadCity,
                    address: hideContacts ? null : (input.loadAddress ?? `ул. Складская, 1`),
                    date_from: input.load_date,
                    date_to: input.load_date,
                    order: 0,
                },
                {
                    type: 'unload',
                    city: input.unloadCity,
                    address: hideContacts ? null : (input.unloadAddress ?? `пр. Индустриальный, 10`),
                    date_from: input.unload_date,
                    date_to: input.unload_date,
                    order: 1,
                },
            ],
        },
        cargo: input.cargo,
        vehicle_requirements: {
            body_types: input.cargo.body_type ? [input.cargo.body_type] : ['тент'],
            loading_types: ['боковая', 'задняя'],
            capacity_tons: input.cargo.weight_kg ? input.cargo.weight_kg / 1000 : 20,
            volume_m3: input.cargo.volume_m3 ?? 82,
            temperature_mode: null,
            comment: null,
        },
        payment: {
            type: 'безналичный',
            vat_included: true,
            delay_days: 14,
            prepayment_percent: 0,
            comment: 'Оплата по оригиналам закрывающих документов',
        },
        trading,
        pricing: input.pricing,
        my_bet,
        has_my_bet: my_bet.has_bet,
        primary_action: 'place_bet',
        load_date: input.load_date,
        unload_date: input.unload_date,
    };

    detail.primary_action = resolvePrimaryAction(detail);
    detail.trading.participants_count = trading.participants_count;
    return detail;
}

export function createInitialAuctions(): AuctionRecord[] {
    const a1 = makeDetail({
        id: '1',
        cargo_num: 'CRG-10021',
        auc_type: 'Down',
        status: 'Active',
        loadCity: 'Москва',
        unloadCity: 'Казань',
        distance_km: 820,
        load_date: '2026-08-05T08:00:00.000Z',
        unload_date: '2026-08-06T18:00:00.000Z',
        cargo: {
            name: 'Паллеты с бытовой химией',
            weight_kg: 18000,
            volume_m3: 76,
            body_type: 'тент',
            description: 'Негабарит отсутствует',
        },
        pricing: {
            current_price: 95_000,
            available_price: 93_000,
            price_per_km: 116,
            min: 80_000,
            max: 120_000,
            step: 1_000,
            currency: 'RUB',
        },
        user_trading_status: 'Losing',
        my_bet: {
            has_bet: true,
            price: 97_000,
            price_with_vat: 97_000,
            price_without_vat: 80_833,
            rank: 2,
            is_winner: false,
            is_cancelled: false,
            cancel_reason: null,
            placed_at: '2026-08-01T12:00:00.000Z',
        },
        trading: { participants_count: 3 },
    });

    const a2 = makeDetail({
        id: '2',
        cargo_num: 'CRG-10045',
        auc_type: 'Up',
        status: 'Active',
        loadCity: 'Санкт-Петербург',
        unloadCity: 'Москва',
        distance_km: 710,
        load_date: '2026-08-07T10:00:00.000Z',
        unload_date: '2026-08-08T16:00:00.000Z',
        cargo: {
            name: 'Металлопрокат',
            weight_kg: 21000,
            volume_m3: 40,
            body_type: 'открытая',
        },
        pricing: {
            current_price: 110_000,
            available_price: 112_000,
            price_per_km: 155,
            min: 100_000,
            max: 150_000,
            step: 2_000,
            currency: 'RUB',
        },
        user_trading_status: null,
        trading: { participants_count: 2 },
    });

    const a3 = makeDetail({
        id: '3',
        cargo_num: 'CRG-10077',
        auc_type: 'FixPrice',
        status: 'Active',
        loadCity: 'Екатеринбург',
        unloadCity: 'Новосибирск',
        distance_km: 1410,
        load_date: '2026-08-09T06:00:00.000Z',
        unload_date: '2026-08-11T20:00:00.000Z',
        cargo: {
            name: 'Продукты питания',
            weight_kg: 15000,
            volume_m3: 70,
            body_type: 'рефрижератор',
        },
        pricing: {
            current_price: 180_000,
            available_price: 180_000,
            price_per_km: 128,
            min: 180_000,
            max: 180_000,
            step: 0,
            currency: 'RUB',
        },
        trading: {
            can_set_bet: true,
            hide_bets_history: true,
            participants_count: 1,
        },
    });

    const a4 = makeDetail({
        id: '4',
        cargo_num: 'CRG-10102',
        auc_type: 'Request',
        status: 'Waiting',
        loadCity: 'Нижний Новгород',
        unloadCity: 'Самара',
        distance_km: 530,
        load_date: '2026-08-12T09:00:00.000Z',
        unload_date: '2026-08-13T15:00:00.000Z',
        cargo: {
            name: 'Стройматериалы',
            weight_kg: 12000,
            volume_m3: 55,
            body_type: 'тент',
        },
        pricing: {
            current_price: null,
            available_price: null,
            price_per_km: null,
            min: 40_000,
            max: 90_000,
            step: 500,
            currency: 'RUB',
        },
        trading: {
            can_set_bet: false,
            participants_count: 0,
        },
    });

    const a5 = makeDetail({
        id: '5',
        cargo_num: 'CRG-10155',
        auc_type: 'Down',
        status: 'Active',
        loadCity: 'Ростов-на-Дону',
        unloadCity: 'Москва',
        distance_km: 1070,
        load_date: '2026-08-04T07:00:00.000Z',
        unload_date: '2026-08-05T22:00:00.000Z',
        cargo: {
            name: 'Автозапчасти',
            weight_kg: 9000,
            volume_m3: 48,
            body_type: 'тент',
        },
        pricing: {
            current_price: 140_000,
            available_price: null,
            price_per_km: 131,
            min: 100_000,
            max: 160_000,
            step: 1_000,
            currency: 'RUB',
        },
        trading: {
            can_set_bet: false,
            hide_points_address_and_contacts: true,
            no_view_cargo_price: true,
            participants_count: 4,
        },
        user_trading_status: 'Winner',
        my_bet: {
            has_bet: true,
            price: 132_000,
            price_with_vat: 132_000,
            price_without_vat: 110_000,
            rank: 1,
            is_winner: true,
            is_cancelled: false,
            cancel_reason: null,
            placed_at: '2026-07-30T16:40:00.000Z',
        },
    });

    const records: AuctionRecord[] = [
        {
            detail: a1,
            bets: [
                {
                    uuid: uuid('101'),
                    carrier_name: 'ТК «ВолгаЛогистик»',
                    is_mine: false,
                    rank: 1,
                    price_with_vat: 95_000,
                    price_without_vat: 79_167,
                    is_winner: false,
                    is_cancelled: false,
                    cancel_reason: null,
                    placed_at: '2026-08-01T14:10:00.000Z',
                },
                {
                    uuid: uuid('102'),
                    carrier_name: CURRENT_CARRIER_NAME,
                    is_mine: true,
                    rank: 2,
                    price_with_vat: 97_000,
                    price_without_vat: 80_833,
                    is_winner: false,
                    is_cancelled: false,
                    cancel_reason: null,
                    placed_at: '2026-08-01T12:00:00.000Z',
                },
                {
                    uuid: uuid('103'),
                    carrier_name: 'ИП Смирнов',
                    is_mine: false,
                    rank: 3,
                    price_with_vat: 99_000,
                    price_without_vat: 82_500,
                    is_winner: false,
                    is_cancelled: true,
                    cancel_reason: 'Отозвана участником',
                    placed_at: '2026-08-01T10:00:00.000Z',
                },
            ],
        },
        {
            detail: a2,
            bets: [
                {
                    uuid: uuid('201'),
                    carrier_name: 'Логистик Плюс',
                    is_mine: false,
                    rank: 1,
                    price_with_vat: 110_000,
                    price_without_vat: 91_667,
                    is_winner: false,
                    is_cancelled: false,
                    cancel_reason: null,
                    placed_at: '2026-08-01T09:00:00.000Z',
                },
                {
                    uuid: uuid('202'),
                    carrier_name: 'ЮгТранс',
                    is_mine: false,
                    rank: 2,
                    price_with_vat: 108_000,
                    price_without_vat: 90_000,
                    is_winner: false,
                    is_cancelled: false,
                    cancel_reason: null,
                    placed_at: '2026-08-01T08:30:00.000Z',
                },
            ],
        },
        {
            detail: a3,
            bets: [
                {
                    uuid: uuid('301'),
                    carrier_name: 'Сибирь Карго',
                    is_mine: false,
                    rank: 1,
                    price_with_vat: 180_000,
                    price_without_vat: 150_000,
                    is_winner: false,
                    is_cancelled: false,
                    cancel_reason: null,
                    placed_at: '2026-08-01T11:00:00.000Z',
                },
            ],
        },
        { detail: a4, bets: [] },
        {
            detail: a5,
            bets: [
                {
                    uuid: uuid('501'),
                    carrier_name: CURRENT_CARRIER_NAME,
                    is_mine: true,
                    rank: 1,
                    price_with_vat: 132_000,
                    price_without_vat: 110_000,
                    is_winner: true,
                    is_cancelled: false,
                    cancel_reason: null,
                    placed_at: '2026-07-30T16:40:00.000Z',
                },
            ],
        },
        ...createPaginationFillers(),
    ];

    for (const record of records) {
        record.detail.trading.participants_count = new Set(
            record.bets.filter((b) => !b.is_cancelled).map((b) => b.carrier_name),
        ).size;
        record.detail.primary_action = resolvePrimaryAction(record.detail);
        record.detail.has_my_bet = record.detail.my_bet.has_bet;
    }

    return records;
}

/** Extra Active lots so pagination (page_size 5/10) is easy to verify manually. */
function createPaginationFillers(): AuctionRecord[] {
    const cities = [
        ['Москва', 'Самара'],
        ['Казань', 'Екатеринбург'],
        ['Санкт-Петербург', 'Нижний Новгород'],
        ['Новосибирск', 'Москва'],
        ['Ростов-на-Дону', 'Казань'],
        ['Самара', 'Санкт-Петербург'],
        ['Екатеринбург', 'Ростов-на-Дону'],
        ['Нижний Новгород', 'Новосибирск'],
        ['Москва', 'Екатеринбург'],
        ['Казань', 'Самара'],
        ['Санкт-Петербург', 'Ростов-на-Дону'],
    ] as const;

    const names = [
        'Упаковка',
        'Оборудование',
        'Ткани',
        'Бумага',
        'Запчасти станков',
        'Мебель',
        'Химия',
        'Кабель',
        'Стекло',
        'Пластик',
        'Инструмент',
    ];

    return cities.map(([loadCity, unloadCity], index) => {
        const id = String(6 + index);
        const price = 70_000 + index * 5_000;
        const detail = makeDetail({
            id,
            cargo_num: `CRG-20${String(100 + index).slice(-3)}`,
            auc_type: index % 2 === 0 ? 'Down' : 'Up',
            status: 'Active',
            loadCity,
            unloadCity,
            distance_km: 400 + index * 50,
            load_date: `2026-08-${String(14 + (index % 10)).padStart(2, '0')}T08:00:00.000Z`,
            unload_date: `2026-08-${String(15 + (index % 10)).padStart(2, '0')}T18:00:00.000Z`,
            cargo: {
                name: names[index] ?? `Груз ${index + 1}`,
                weight_kg: 8_000 + index * 500,
                volume_m3: 40 + index,
                body_type: 'тент',
            },
            pricing: {
                current_price: price,
                available_price: price - 1_000,
                price_per_km: Math.round(price / (400 + index * 50)),
                min: price - 20_000,
                max: price + 30_000,
                step: 1_000,
                currency: 'RUB',
            },
            trading: { participants_count: 0 },
        });

        return { detail, bets: [] };
    });
}

export { resolvePrimaryAction };
