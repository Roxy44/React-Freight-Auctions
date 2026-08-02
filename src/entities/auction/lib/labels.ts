import type { AuctionStatus, AuctionType, PrimaryAction, UserTradingStatus } from '@/entities/auction/model/schemas';

export const AUCTION_TYPE_LABELS: Record<AuctionType, string> = {
    Request: 'Запрос ставки',
    Up: 'На повышение',
    Down: 'На понижение',
    FixPrice: 'Фикс. цена',
};

export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
    Draft: 'Черновик',
    Active: 'Активен',
    Waiting: 'Ожидание',
    Finished: 'Завершён',
    Cancelled: 'Отменён',
};

export const TRADING_STATUS_LABELS: Record<Exclude<UserTradingStatus, null>, string> = {
    Leading: 'Лидируете',
    Losing: 'Проигрываете',
    Winner: 'Победитель',
    Outbid: 'Перебиты',
    None: 'Без статуса',
};

export const PRIMARY_ACTION_LABELS: Record<PrimaryAction, string> = {
    place_bet: 'Сделать ставку',
    edit_bet: 'Изменить ставку',
    view_bets: 'Смотреть ставки',
    disabled: 'Ставка недоступна',
};

export const ROUTE_POINT_TYPE_LABELS: Record<'load' | 'unload' | 'waypoint', string> = {
    load: 'Погрузка',
    unload: 'Выгрузка',
    waypoint: 'Промежуточная точка',
};
