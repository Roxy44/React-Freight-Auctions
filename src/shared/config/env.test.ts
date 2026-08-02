import { describe, expect, it } from 'vitest';

import { APP_NAME } from '@/shared/config/env';

describe('project bootstrap', () => {
    it('exposes app name', () => {
        expect(APP_NAME).toBe('Freight Auctions');
    });
});
