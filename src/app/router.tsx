import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

import { RootLayout } from '@/app/layouts/RootLayout.component';
import { AuctionBetPage } from '@/pages/auction-bet/AuctionBetPage.component';
import { AuctionBetsPage } from '@/pages/auction-bets/AuctionBetsPage.component';
import { AuctionDetailPage } from '@/pages/auction-detail/AuctionDetailPage.component';
import { AuctionsListPage } from '@/pages/auctions-list/AuctionsListPage.component';

const rootRoute = createRootRoute({
    component: RootLayout,
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: AuctionsListPage,
});

const auctionDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auctions/$auctionUuid',
    component: AuctionDetailPage,
});

const auctionBetsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auctions/$auctionUuid/bets',
    component: AuctionBetsPage,
});

const auctionBetRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auctions/$auctionUuid/bet',
    component: AuctionBetPage,
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    auctionDetailRoute,
    auctionBetsRoute,
    auctionBetRoute,
]);

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
