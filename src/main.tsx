import { StrictMode } from 'react';

import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

import { AppProviders } from '@/app/providers/AppProviders.component';
import { router } from '@/app/router';

import '@/app/styles/global.css';

async function enableMocking() {
    // Demo SPA: no real backend — MSW runs in production (e.g. GitHub Pages) too.
    const { worker } = await import('@/shared/api/msw/browser');
    return worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
            url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
        },
    });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element #root not found');
}

enableMocking().then(() => {
    createRoot(rootElement).render(
        <StrictMode>
            <AppProviders>
                <RouterProvider router={router} />
            </AppProviders>
        </StrictMode>,
    );
});
