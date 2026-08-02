import { Typography } from 'antd';
import { useParams } from '@tanstack/react-router';

export function AuctionBetsPage() {
    const { auctionUuid } = useParams({ from: '/auctions/$auctionUuid/bets' });

    return (
        <div>
            <Typography.Title level={2}>История ставок</Typography.Title>
            <Typography.Paragraph type='secondary'>UUID: {auctionUuid}</Typography.Paragraph>
        </div>
    );
}
