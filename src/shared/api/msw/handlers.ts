import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/shared/config/env';

/**
 * Temporary stubs aligned with draft `openapi.auctions.v0.json`.
 * Rebuild against the official schema when it arrives.
 */
export const handlers = [
    http.post(`${API_BASE_URL}/auctions/list`, async () => {
        return HttpResponse.json({
            items: [],
            total: 0,
            page: 1,
            page_size: 20,
        });
    }),
];
