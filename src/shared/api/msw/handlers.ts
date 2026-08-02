import { HttpResponse, delay, http } from 'msw';

import { auctionListRequestSchema } from '@/entities/auction/model/schemas';
import { API_BASE_URL } from '@/shared/config/env';
import {
    StoreForbiddenError,
    StoreNotFoundError,
    StoreValidationError,
    getAuction,
    listAuctions,
    listBets,
    placeBet,
} from '@/shared/api/msw/store';

const base = API_BASE_URL;

export const handlers = [
    http.post(`${base}/auctions/list`, async ({ request }) => {
        await delay(300);

        const json = await request.json();
        const parsed = auctionListRequestSchema.safeParse(json);

        if (!parsed.success) {
            return HttpResponse.json(
                {
                    message: 'Validation failed',
                    errors: parsed.error.issues.map((issue) => ({
                        field: issue.path.join('.') || 'body',
                        code: issue.code,
                        message: issue.message,
                    })),
                },
                { status: 422 },
            );
        }

        return HttpResponse.json(listAuctions(parsed.data));
    }),

    http.get(`${base}/auctions/:auctionUuid`, async ({ params }) => {
        await delay(250);
        const auctionUuid = String(params.auctionUuid);

        try {
            return HttpResponse.json(getAuction(auctionUuid));
        } catch (error) {
            if (error instanceof StoreNotFoundError) {
                return HttpResponse.json({ message: error.message, code: 'not_found' }, { status: 404 });
            }
            throw error;
        }
    }),

    http.get(`${base}/auctions/:auctionUuid/bets`, async ({ params }) => {
        await delay(250);
        const auctionUuid = String(params.auctionUuid);

        try {
            return HttpResponse.json(listBets(auctionUuid));
        } catch (error) {
            if (error instanceof StoreNotFoundError) {
                return HttpResponse.json({ message: error.message, code: 'not_found' }, { status: 404 });
            }
            throw error;
        }
    }),

    http.post(`${base}/auctions/:auctionUuid/bets`, async ({ params, request }) => {
        await delay(350);
        const auctionUuid = String(params.auctionUuid);
        const body = (await request.json()) as { price?: number };

        try {
            return HttpResponse.json(placeBet(auctionUuid, { price: Number(body.price) }));
        } catch (error) {
            if (error instanceof StoreNotFoundError) {
                return HttpResponse.json({ message: error.message, code: 'not_found' }, { status: 404 });
            }
            if (error instanceof StoreForbiddenError) {
                return HttpResponse.json({ message: error.message, code: 'forbidden' }, { status: 403 });
            }
            if (error instanceof StoreValidationError) {
                return HttpResponse.json({ message: error.message, errors: error.errors }, { status: 422 });
            }
            throw error;
        }
    }),
];
