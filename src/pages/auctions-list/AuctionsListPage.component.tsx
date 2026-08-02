import { Flex, Pagination, Skeleton, Space, Typography } from 'antd';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useRef } from 'react';

import { useAuctionListQuery } from '@/entities/auction/api/auction-queries';
import {
    DEFAULT_AUCTIONS_SEARCH,
    toAuctionListRequest,
    toAuctionsSearchNavigate,
    type AuctionsSearchParams,
} from '@/entities/auction/lib/search-params';
import { ApiError } from '@/shared/api/errors';
import { QueryState } from '@/shared/ui/QueryState.component';
import { AuctionCard } from '@/widgets/auction-card';
import { AuctionFilters } from '@/widgets/auction-filters';

import styles from './AuctionsListPage.module.css';

const routeApi = getRouteApi('/');
const PAGE_SIZE_OPTIONS = [1, 5, 10, 20];

export function AuctionsListPage() {
    const search = routeApi.useSearch();
    const navigate = useNavigate({ from: '/' });
    const listParams = toAuctionListRequest(search);
    const query = useAuctionListQuery(listParams);
    const listTopRef = useRef<HTMLDivElement>(null);

    const setSearch = (patch: Partial<AuctionsSearchParams>) => {
        void navigate({
            search: toAuctionsSearchNavigate({ ...search, ...patch }),
        });
    };

    const changePage = (page: number, pageSize: number) => {
        setSearch({ page, page_size: pageSize });
        listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const errorMessage = query.error instanceof ApiError ? query.error.message : 'Не удалось загрузить список аукционов';
    const total = query.data?.total ?? 0;

    const renderPagination = (className?: string) => (
        <Pagination
            className={[styles.pagination, className].filter(Boolean).join(' ')}
            current={search.page}
            pageSize={search.page_size}
            total={total}
            showSizeChanger
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            showTotal={(count) => `Всего ${count}`}
            onChange={changePage}
        />
    );

    return (
        <Space direction='vertical' size='large' style={{ width: '100%' }} className={styles.page}>
            <div>
                <Typography.Title level={2} style={{ marginBottom: 4 }}>
                    Аукционы
                </Typography.Title>
                <Typography.Paragraph type='secondary' style={{ marginBottom: 0 }}>
                    Лента лотов для перевозчика-участника торгов. Фильтры сохраняются в URL.
                </Typography.Paragraph>
            </div>

            <AuctionFilters
                value={search}
                onApply={setSearch}
                onReset={() =>
                    void navigate({
                        search: { ...DEFAULT_AUCTIONS_SEARCH },
                    })
                }
            />

            <div ref={listTopRef} className={styles.listTop}>
                {!query.isLoading && !query.isError && total > 0 ? (
                    <Flex justify='flex-end' align='center' wrap gap={8} className={styles.paginationTop}>
                        {renderPagination()}
                    </Flex>
                ) : null}
            </div>

            <QueryState
                isLoading={query.isLoading}
                isError={query.isError}
                isEmpty={!query.isLoading && !query.isError && (query.data?.items.length ?? 0) === 0}
                errorMessage={errorMessage}
                emptyDescription='По выбранным фильтрам аукционов нет'
                onRetry={() => void query.refetch()}
                skeleton={
                    <Space direction='vertical' style={{ width: '100%' }} size='middle'>
                        <Skeleton active paragraph={{ rows: 4 }} />
                        <Skeleton active paragraph={{ rows: 4 }} />
                        <Skeleton active paragraph={{ rows: 4 }} />
                    </Space>
                }
            >
                <Space direction='vertical' size='middle' style={{ width: '100%' }}>
                    {query.data?.items.map((auction) => (
                        <AuctionCard key={auction.uuid} auction={auction} />
                    ))}

                    {total > 0 ? (
                        <Flex justify='flex-end' className={styles.paginationBottomDesktop}>
                            {renderPagination()}
                        </Flex>
                    ) : null}
                </Space>
            </QueryState>

            {!query.isLoading && !query.isError && total > 0 ? (
                <div className={styles.paginationStickyMobile}>{renderPagination()}</div>
            ) : null}
        </Space>
    );
}
