import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import { Link } from '@tanstack/react-router';

import { usePrefetchAuctionDetail } from '@/entities/auction/api/auction-queries';
import { formatDateTime, formatMoney } from '@/entities/auction/lib/format';
import {
    AUCTION_STATUS_LABELS,
    AUCTION_TYPE_LABELS,
    PRIMARY_ACTION_LABELS,
    TRADING_STATUS_LABELS,
} from '@/entities/auction/lib/labels';
import type { AuctionListItem } from '@/entities/auction/model/schemas';

import styles from './AuctionCard.module.css';

type AuctionCardProps = {
    auction: AuctionListItem;
};

export function AuctionCard({ auction }: AuctionCardProps) {
    const prefetch = usePrefetchAuctionDetail();
    const tradingLabel =
        auction.user_trading_status != null ? TRADING_STATUS_LABELS[auction.user_trading_status] : null;

    return (
        <Card
            className={styles.card}
            onMouseEnter={() => prefetch(auction.uuid)}
            onFocus={() => prefetch(auction.uuid)}
        >
            <Flex justify='space-between' align='flex-start' gap={12} wrap>
                <div>
                    <Space size={8} wrap>
                        <Typography.Text type='secondary'>Заявка</Typography.Text>
                        <Typography.Text strong>{auction.cargo_num}</Typography.Text>
                        <Tag>{AUCTION_TYPE_LABELS[auction.auc_type]}</Tag>
                        <Tag color={auction.status === 'Active' ? 'green' : 'default'}>
                            {AUCTION_STATUS_LABELS[auction.status]}
                        </Tag>
                        {tradingLabel ? <Tag color='blue'>{tradingLabel}</Tag> : null}
                        <Tag color={auction.has_my_bet ? 'purple' : 'default'}>
                            {auction.has_my_bet ? 'Моя ставка есть' : 'Моей ставки нет'}
                        </Tag>
                    </Space>

                    <Typography.Title level={4} className={styles.route}>
                        {auction.route.load_city} → {auction.route.unload_city}
                    </Typography.Title>

                    <Typography.Paragraph type='secondary' className={styles.meta}>
                        Погрузка: {formatDateTime(auction.load_date)} · Выгрузка: {formatDateTime(auction.unload_date)}
                    </Typography.Paragraph>

                    <Typography.Paragraph className={styles.meta}>
                        {auction.cargo.name}
                        {auction.cargo.weight_kg != null ? ` · ${auction.cargo.weight_kg} кг` : ''}
                        {auction.cargo.volume_m3 != null ? ` · ${auction.cargo.volume_m3} м³` : ''}
                        {auction.cargo.body_type ? ` · ${auction.cargo.body_type}` : ''}
                    </Typography.Paragraph>
                </div>

                <div className={styles.pricing}>
                    <Typography.Text type='secondary'>Текущая цена</Typography.Text>
                    <Typography.Title level={3} className={styles.price}>
                        {formatMoney(auction.pricing.current_price)}
                    </Typography.Title>
                    <Typography.Text type='secondary'>
                        {formatMoney(auction.pricing.price_per_km)}/км · шаг {formatMoney(auction.pricing.bet_step)}
                    </Typography.Text>
                </div>
            </Flex>

            <Flex gap={8} wrap className={styles.actions}>
                <Link to='/auctions/$auctionUuid' params={{ auctionUuid: auction.uuid }}>
                    <Button>Подробнее</Button>
                </Link>
                <Link to='/auctions/$auctionUuid/bets' params={{ auctionUuid: auction.uuid }}>
                    <Button>Ставки</Button>
                </Link>
                {auction.primary_action === 'disabled' ? (
                    <Button disabled>{PRIMARY_ACTION_LABELS.disabled}</Button>
                ) : auction.primary_action === 'view_bets' ? (
                    <Link to='/auctions/$auctionUuid/bets' params={{ auctionUuid: auction.uuid }}>
                        <Button type='primary'>{PRIMARY_ACTION_LABELS.view_bets}</Button>
                    </Link>
                ) : (
                    <Link to='/auctions/$auctionUuid/bet' params={{ auctionUuid: auction.uuid }}>
                        <Button type='primary'>{PRIMARY_ACTION_LABELS[auction.primary_action]}</Button>
                    </Link>
                )}
            </Flex>
        </Card>
    );
}
