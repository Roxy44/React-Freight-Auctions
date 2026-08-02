import { API_BASE_URL } from '@/shared/config/env';
import { parseApiError } from '@/shared/api/errors';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
    method?: HttpMethod;
    body?: unknown;
    signal?: AbortSignal;
};

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, signal } = options;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        signal,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
        throw await parseApiError(response);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}
