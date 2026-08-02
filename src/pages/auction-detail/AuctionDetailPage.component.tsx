import { Typography } from 'antd';
import { useParams } from '@tanstack/react-router';

export function AuctionDetailPage() {
    const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid' });

    return (
        <div>
            <Typography.Title level={2}>Аукцион</Typography.Title>
            <Typography.Paragraph type='secondary'>UUID: {auctionUuid}</Typography.Paragraph>
        </div>
    );
}
