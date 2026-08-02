import { StrictMode } from 'react';

import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

import { AppProviders } from '@/app/providers/AppProviders.component';
import { router } from '@/app/router';

import '@/app/styles/global.css';

async function enableMocking() {
    if (import.meta.env.MODE !== 'development') {
        return;
    }

    const { worker } = await import('@/shared/api/msw/browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
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
