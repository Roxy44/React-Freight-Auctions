import { z } from 'zod';

export const auctionTypeSchema = z.enum(['Request', 'Up', 'Down', 'FixPrice']);

export const auctionStatusSchema = z.enum(['Draft', 'Active', 'Waiting', 'Finished', 'Cancelled']);

export const userTradingStatusSchema = z.enum(['Leading', 'Losing', 'Winner', 'Outbid', 'None']).nullable();

export const primaryActionSchema = z.enum(['place_bet', 'edit_bet', 'view_bets', 'disabled']);

export const routeSummarySchema = z.object({
    load_city: z.string(),
    unload_city: z.string(),
    distance_km: z.number().nullable().optional(),
});

export const cargoSummarySchema = z.object({
    name: z.string(),
    weight_kg: z.number().nullable().optional(),
    volume_m3: z.number().nullable().optional(),
    body_type: z.string().nullable().optional(),
});

export const pricingSummarySchema = z.object({
    current_price: z.number().nullable().optional(),
    price_per_km: z.number().nullable().optional(),
    bet_step: z.number().nullable().optional(),
    currency: z.string().optional(),
});

export const auctionListItemSchema = z.object({
    uuid: z.string().uuid(),
    cargo_num: z.string(),
    auc_type: auctionTypeSchema,
    status: auctionStatusSchema,
    user_trading_status: userTradingStatusSchema.optional(),
    route: routeSummarySchema,
    load_date: z.string().nullable().optional(),
    unload_date: z.string().nullable().optional(),
    cargo: cargoSummarySchema,
    pricing: pricingSummarySchema,
    has_my_bet: z.boolean(),
    primary_action: primaryActionSchema,
    is_available: z.boolean().nullable().optional(),
});

export const auctionListRequestSchema = z.object({
    page: z.number().int().min(1),
    page_size: z.number().int().min(1).max(100),
    cargo_num: z.string().nullable().optional(),
    status: auctionStatusSchema.nullable().optional(),
    statuses: z.array(auctionStatusSchema).nullable().optional(),
    auc_type: auctionTypeSchema.nullable().optional(),
    load_city: z.string().nullable().optional(),
    unload_city: z.string().nullable().optional(),
    load_date_from: z.string().nullable().optional(),
    load_date_to: z.string().nullable().optional(),
    is_available: z.boolean().nullable().optional(),
    is_bidder: z.boolean().nullable().optional(),
    price_from: z.number().nullable().optional(),
    price_to: z.number().nullable().optional(),
});

export const auctionListResponseSchema = z.object({
    items: z.array(auctionListItemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    page_size: z.number().int().min(1),
});

export const organizerSchema = z.object({
    name: z.string(),
    inn: z.string().nullable().optional(),
    rating: z.number().nullable().optional(),
});

export const contactsSchema = z.object({
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    person_name: z.string().nullable().optional(),
});

export const routePointSchema = z.object({
    type: z.enum(['load', 'unload', 'waypoint']),
    city: z.string(),
    address: z.string().nullable().optional(),
    date_from: z.string().nullable().optional(),
    date_to: z.string().nullable().optional(),
    order: z.number().int().optional(),
});

export const routeDetailSchema = z.object({
    load_city: z.string().optional(),
    unload_city: z.string().optional(),
    distance_km: z.number().nullable().optional(),
    points: z.array(routePointSchema).min(2),
});

export const cargoDetailSchema = cargoSummarySchema.extend({
    description: z.string().nullable().optional(),
    packaging: z.string().nullable().optional(),
    hazard_class: z.string().nullable().optional(),
});

export const vehicleRequirementsSchema = z.object({
    body_types: z.array(z.string()).optional(),
    loading_types: z.array(z.string()).optional(),
    capacity_tons: z.number().nullable().optional(),
    volume_m3: z.number().nullable().optional(),
    temperature_mode: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
});

export const paymentTermsSchema = z.object({
    type: z.string().nullable().optional(),
    vat_included: z.boolean().nullable().optional(),
    delay_days: z.number().int().nullable().optional(),
    prepayment_percent: z.number().nullable().optional(),
    comment: z.string().nullable().optional(),
});

export const tradingParamsSchema = z.object({
    can_set_bet: z.boolean(),
    hide_bets_history: z.boolean(),
    hide_points_address_and_contacts: z.boolean(),
    no_view_cargo_price: z.boolean(),
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    participants_count: z.number().int().nullable().optional(),
});

export const pricingDetailSchema = z.object({
    current_price: z.number().nullable().optional(),
    available_price: z.number().nullable().optional(),
    price_per_km: z.number().nullable().optional(),
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    step: z.number().nullable().optional(),
    currency: z.string().optional(),
});

export const myBetStateSchema = z.object({
    has_bet: z.boolean(),
    price: z.number().nullable().optional(),
    price_with_vat: z.number().nullable().optional(),
    price_without_vat: z.number().nullable().optional(),
    rank: z.number().int().nullable().optional(),
    is_winner: z.boolean().nullable().optional(),
    is_cancelled: z.boolean().nullable().optional(),
    cancel_reason: z.string().nullable().optional(),
    placed_at: z.string().nullable().optional(),
});

export const auctionDetailSchema = z.object({
    uuid: z.string().uuid(),
    cargo_num: z.string(),
    auc_type: auctionTypeSchema,
    status: auctionStatusSchema,
    user_trading_status: userTradingStatusSchema.optional(),
    organizer: organizerSchema,
    contacts: contactsSchema.nullable().optional(),
    route: routeDetailSchema,
    cargo: cargoDetailSchema,
    vehicle_requirements: vehicleRequirementsSchema.optional(),
    payment: paymentTermsSchema,
    trading: tradingParamsSchema,
    pricing: pricingDetailSchema,
    my_bet: myBetStateSchema,
    primary_action: primaryActionSchema,
    has_my_bet: z.boolean().optional(),
    load_date: z.string().nullable().optional(),
    unload_date: z.string().nullable().optional(),
});

export const betItemSchema = z.object({
    uuid: z.string().uuid(),
    carrier_name: z.string(),
    is_mine: z.boolean().nullable().optional(),
    rank: z.number().int().nullable().optional(),
    price_with_vat: z.number().nullable().optional(),
    price_without_vat: z.number().nullable().optional(),
    is_winner: z.boolean(),
    is_cancelled: z.boolean(),
    cancel_reason: z.string().nullable().optional(),
    placed_at: z.string().nullable().optional(),
});

export const auctionBetsResponseSchema = z.object({
    is_hidden: z.boolean(),
    participants_count: z.number().int().min(0),
    items: z.array(betItemSchema),
});

export const placeBetRequestSchema = z.object({
    price: z.number().positive(),
});

export const placeBetResponseSchema = z.object({
    bet: betItemSchema,
    auction: z
        .object({
            uuid: z.string().uuid().optional(),
            pricing: pricingDetailSchema.optional(),
            user_trading_status: userTradingStatusSchema.optional(),
            my_bet: myBetStateSchema.optional(),
            has_my_bet: z.boolean().optional(),
            primary_action: primaryActionSchema.optional(),
        })
        .optional(),
});

export const validationErrorItemSchema = z.object({
    field: z.string(),
    code: z.string().nullable().optional(),
    message: z.string(),
});

export type AuctionType = z.infer<typeof auctionTypeSchema>;
export type AuctionStatus = z.infer<typeof auctionStatusSchema>;
export type UserTradingStatus = z.infer<typeof userTradingStatusSchema>;
export type PrimaryAction = z.infer<typeof primaryActionSchema>;
export type AuctionListRequest = z.infer<typeof auctionListRequestSchema>;
export type AuctionListItem = z.infer<typeof auctionListItemSchema>;
export type AuctionListResponse = z.infer<typeof auctionListResponseSchema>;
export type AuctionDetail = z.infer<typeof auctionDetailSchema>;
export type BetItem = z.infer<typeof betItemSchema>;
export type AuctionBetsResponse = z.infer<typeof auctionBetsResponseSchema>;
export type PlaceBetRequest = z.infer<typeof placeBetRequestSchema>;
export type PlaceBetResponse = z.infer<typeof placeBetResponseSchema>;
