import { Alert, Button, Card, Col, Descriptions, Flex, Row, Space, Tag, Typography } from 'antd';
import { Link, useParams } from '@tanstack/react-router';

import { useAuctionDetailQuery } from '@/entities/auction/api/auction-queries';
import { formatDateTime, formatMoney } from '@/entities/auction/lib/format';
import {
    AUCTION_STATUS_LABELS,
    AUCTION_TYPE_LABELS,
    PRIMARY_ACTION_LABELS,
    ROUTE_POINT_TYPE_LABELS,
    TRADING_STATUS_LABELS,
} from '@/entities/auction/lib/labels';
import { DEFAULT_AUCTIONS_SEARCH } from '@/entities/auction/lib/search-params';
import { ApiError } from '@/shared/api/errors';
import { QueryState } from '@/shared/ui/QueryState.component';

import styles from './AuctionDetailPage.module.css';

export function AuctionDetailPage() {
    const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' });
    const query = useAuctionDetailQuery(auctionUuid);
    const auction = query.data;

    const errorMessage = query.error instanceof ApiError ? query.error.message : 'Не удалось загрузить аукцион';

    return (
        <QueryState
            isLoading={query.isLoading}
            isError={query.isError}
            errorMessage={errorMessage}
            onRetry={() => void query.refetch()}
        >
            {auction ? (
                <Space direction='vertical' size='large' className={styles.page}>
                    <Flex justify='space-between' align='flex-start' gap={12} wrap>
                        <div>
                            <Typography.Title level={2} style={{ marginBottom: 8 }}>
                                Заявка {auction.cargo_num}
                            </Typography.Title>
                            <Space wrap>
                                <Tag>{AUCTION_TYPE_LABELS[auction.auc_type]}</Tag>
                                <Tag color='green'>{AUCTION_STATUS_LABELS[auction.status]}</Tag>
                                {auction.user_trading_status ? (
                                    <Tag color='blue'>{TRADING_STATUS_LABELS[auction.user_trading_status]}</Tag>
                                ) : null}
                            </Space>
                        </div>
                        <Space wrap>
                            <Link to='/' search={DEFAULT_AUCTIONS_SEARCH}>
                                <Button>К списку</Button>
                            </Link>
                            <Link to='/auctions/$auctionUuid/bets' params={{ auctionUuid }}>
                                <Button>История ставок</Button>
                            </Link>
                            {auction.trading.can_set_bet ? (
                                <Link to='/auctions/$auctionUuid/bet' params={{ auctionUuid }}>
                                    <Button type='primary'>
                                        {PRIMARY_ACTION_LABELS[auction.primary_action === 'edit_bet' ? 'edit_bet' : 'place_bet']}
                                    </Button>
                                </Link>
                            ) : (
                                <Button disabled>{PRIMARY_ACTION_LABELS.disabled}</Button>
                            )}
                        </Space>
                    </Flex>

                    {(auction.trading.hide_bets_history ||
                        auction.trading.hide_points_address_and_contacts ||
                        auction.trading.no_view_cargo_price ||
                        !auction.trading.can_set_bet) && (
                        <Alert
                            type='info'
                            showIcon
                            message='Ограничения доступа'
                            description={
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {!auction.trading.can_set_bet ? <li>Ставку поставить нельзя</li> : null}
                                    {auction.trading.hide_bets_history ? <li>История ставок скрыта</li> : null}
                                    {auction.trading.hide_points_address_and_contacts ? (
                                        <li>Адреса точек и контакты скрыты</li>
                                    ) : null}
                                    {auction.trading.no_view_cargo_price ? <li>Цена груза скрыта</li> : null}
                                </ul>
                            }
                        />
                    )}

                    <Row gutter={[16, 16]} className={styles.grid} align='stretch'>
                        <Col xs={24} lg={12}>
                            <Card title='Маршрут' className={styles.card}>
                                <Typography.Paragraph strong className={styles.routeSummary}>
                                    {auction.route.load_city} → {auction.route.unload_city}
                                    {auction.route.distance_km != null ? ` · ${auction.route.distance_km} км` : ''}
                                </Typography.Paragraph>
                                <div className={styles.points}>
                                    {auction.route.points.map((point) => (
                                        <div
                                            key={`${point.type}-${point.order}-${point.city}`}
                                            className={styles.point}
                                        >
                                            <div className={styles.pointLabel}>{ROUTE_POINT_TYPE_LABELS[point.type]}</div>
                                            <div className={styles.pointBody}>
                                                <div className={styles.pointCity}>{point.city}</div>
                                                <div className={styles.pointMeta}>{point.address ?? 'Адрес скрыт'}</div>
                                                <div className={styles.pointDates}>
                                                    {formatDateTime(point.date_from)} — {formatDateTime(point.date_to)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title='Торги и цена' className={styles.card}>
                                <Descriptions className={styles.descriptions} column={1} size='small' colon>
                                    <Descriptions.Item label='Текущая цена'>
                                        {formatMoney(auction.pricing.current_price)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Доступная цена'>
                                        {formatMoney(auction.pricing.available_price)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Мин / макс / шаг'>
                                        {formatMoney(auction.pricing.min)} / {formatMoney(auction.pricing.max)} /{' '}
                                        {formatMoney(auction.pricing.step)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Цена за км'>
                                        {formatMoney(auction.pricing.price_per_km)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Участников'>
                                        {auction.trading.participants_count ?? '—'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Период'>
                                        {formatDateTime(auction.trading.starts_at)} —{' '}
                                        {formatDateTime(auction.trading.ends_at)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title='Груз и ТС' className={styles.card}>
                                <Descriptions className={styles.descriptions} column={1} size='small' colon>
                                    <Descriptions.Item label='Название'>{auction.cargo.name}</Descriptions.Item>
                                    <Descriptions.Item label='Вес'>{auction.cargo.weight_kg ?? '—'} кг</Descriptions.Item>
                                    <Descriptions.Item label='Объём'>{auction.cargo.volume_m3 ?? '—'} м³</Descriptions.Item>
                                    <Descriptions.Item label='Кузов'>{auction.cargo.body_type ?? '—'}</Descriptions.Item>
                                    <Descriptions.Item label='Описание'>{auction.cargo.description ?? '—'}</Descriptions.Item>
                                    <Descriptions.Item label='Требования к ТС'>
                                        {(auction.vehicle_requirements?.body_types ?? []).join(', ') || '—'}
                                        {auction.vehicle_requirements?.loading_types?.length
                                            ? ` · погрузка: ${auction.vehicle_requirements.loading_types.join(', ')}`
                                            : ''}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title='Организатор и оплата' className={styles.card}>
                                <Descriptions className={styles.descriptions} column={1} size='small' colon>
                                    <Descriptions.Item label='Организатор'>{auction.organizer.name}</Descriptions.Item>
                                    <Descriptions.Item label='ИНН'>{auction.organizer.inn ?? '—'}</Descriptions.Item>
                                    <Descriptions.Item label='Рейтинг'>{auction.organizer.rating ?? '—'}</Descriptions.Item>
                                    <Descriptions.Item label='Контакты'>
                                        {auction.contacts
                                            ? `${auction.contacts.person_name ?? ''} · ${auction.contacts.phone ?? ''} · ${auction.contacts.email ?? ''}`
                                            : 'Скрыты'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Оплата'>
                                        {auction.payment.type ?? '—'}
                                        {auction.payment.vat_included != null
                                            ? `, НДС ${auction.payment.vat_included ? 'включён' : 'не включён'}`
                                            : ''}
                                        {auction.payment.delay_days != null ? `, отсрочка ${auction.payment.delay_days} дн.` : ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label='Моя ставка'>
                                        {auction.my_bet.has_bet
                                            ? `${formatMoney(auction.my_bet.price)} · место ${auction.my_bet.rank ?? '—'}`
                                            : 'Нет'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>
                    </Row>
                </Space>
            ) : null}
        </QueryState>
    );
}
