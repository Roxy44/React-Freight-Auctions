import { Alert, Button, Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link, useParams } from '@tanstack/react-router';

import { useAuctionBetsQuery, useAuctionDetailQuery } from '@/entities/auction/api/auction-queries';
import { formatDateTime, formatMoney } from '@/entities/auction/lib/format';
import type { BetItem } from '@/entities/auction/model/schemas';
import { ApiError } from '@/shared/api/errors';
import { QueryState } from '@/shared/ui/QueryState.component';

const columns: ColumnsType<BetItem> = [
    {
        title: 'Место',
        dataIndex: 'rank',
        width: 80,
        render: (value: number | null | undefined) => value ?? '—',
    },
    {
        title: 'Перевозчик',
        dataIndex: 'carrier_name',
        render: (value: string, row) => (
            <Space>
                <span>{value}</span>
                {row.is_mine ? <Tag color='purple'>Моя</Tag> : null}
            </Space>
        ),
    },
    {
        title: 'С НДС',
        dataIndex: 'price_with_vat',
        render: (value: number | null | undefined) => formatMoney(value),
    },
    {
        title: 'Без НДС',
        dataIndex: 'price_without_vat',
        render: (value: number | null | undefined) => formatMoney(value),
    },
    {
        title: 'Статус',
        key: 'flags',
        render: (_, row) => (
            <Space wrap>
                {row.is_winner ? <Tag color='green'>Победитель</Tag> : null}
                {row.is_cancelled ? <Tag color='red'>Отменена</Tag> : null}
                {!row.is_winner && !row.is_cancelled ? <Tag>Активна</Tag> : null}
            </Space>
        ),
    },
    {
        title: 'Причина отмены',
        dataIndex: 'cancel_reason',
        render: (value: string | null | undefined) => value ?? '—',
    },
    {
        title: 'Время',
        dataIndex: 'placed_at',
        render: (value: string | null | undefined) => formatDateTime(value),
    },
];

export function AuctionBetsPage() {
    const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' });
    const detailQuery = useAuctionDetailQuery(auctionUuid);
    const betsQuery = useAuctionBetsQuery(auctionUuid);

    const error =
        (betsQuery.error instanceof ApiError && betsQuery.error.message) ||
        (detailQuery.error instanceof ApiError && detailQuery.error.message) ||
        'Не удалось загрузить ставки';

    const hiddenByDetail = detailQuery.data?.trading.hide_bets_history === true;
    const hiddenByResponse = betsQuery.data?.is_hidden === true;
    const isHidden = hiddenByDetail || hiddenByResponse;

    return (
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
            <FlexHeader auctionUuid={auctionUuid} cargoNum={detailQuery.data?.cargo_num} />

            <QueryState
                isLoading={betsQuery.isLoading || detailQuery.isLoading}
                isError={betsQuery.isError || detailQuery.isError}
                errorMessage={error}
                onRetry={() => {
                    void betsQuery.refetch();
                    void detailQuery.refetch();
                }}
            >
                {isHidden ? (
                    <Alert
                        type='warning'
                        showIcon
                        message='История ставок скрыта'
                        description='Для этого аукциона действует ограничение hide_bets_history.'
                    />
                ) : (
                    <Card>
                        <Typography.Paragraph>
                            Участников: <strong>{betsQuery.data?.participants_count ?? 0}</strong>
                        </Typography.Paragraph>
                        <QueryState
                            isLoading={false}
                            isError={false}
                            isEmpty={(betsQuery.data?.items.length ?? 0) === 0}
                            emptyDescription='Ставок пока нет'
                        >
                            <Table
                                rowKey='uuid'
                                columns={columns}
                                dataSource={betsQuery.data?.items}
                                pagination={false}
                                scroll={{ x: true }}
                            />
                        </QueryState>
                    </Card>
                )}
            </QueryState>
        </Space>
    );
}

function FlexHeader({ auctionUuid, cargoNum }: { auctionUuid: string; cargoNum?: string }) {
    return (
        <Space direction='vertical' size={4} style={{ width: '100%' }}>
            <Typography.Title level={2} style={{ marginBottom: 0 }}>
                История ставок
            </Typography.Title>
            <Typography.Text type='secondary'>{cargoNum ? `Заявка ${cargoNum}` : auctionUuid}</Typography.Text>
            <Space wrap>
                <Link to='/auctions/$auctionUuid' params={{ auctionUuid }}>
                    <Button>К аукциону</Button>
                </Link>
                <Link to='/auctions/$auctionUuid/bet' params={{ auctionUuid }}>
                    <Button type='primary'>Сделать ставку</Button>
                </Link>
            </Space>
        </Space>
    );
}
