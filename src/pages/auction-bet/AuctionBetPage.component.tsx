import { Typography } from 'antd';
import { useParams } from '@tanstack/react-router';

export function AuctionBetPage() {
    const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bet' });

    return (
        <div>
            <Typography.Title level={2}>Установка ставки</Typography.Title>
            <Typography.Paragraph type='secondary'>UUID: {auctionUuid}</Typography.Paragraph>
        </div>
    );
}
