import { describe, expect, it } from 'vitest';

import { buildBetSchema } from '@/entities/auction/lib/bet-schema';

describe('bet validation schema', () => {
    const schema = buildBetSchema(80_000, 120_000, 1_000);

    it('requires price greater than 0', () => {
        expect(schema.safeParse({ price: 0 }).success).toBe(false);
        expect(schema.safeParse({ price: -1 }).success).toBe(false);
    });

    it('accepts price within min/max/step', () => {
        expect(schema.safeParse({ price: 90_000 }).success).toBe(true);
    });

    it('rejects below min, above max, and off-step', () => {
        expect(schema.safeParse({ price: 79_000 }).success).toBe(false);
        expect(schema.safeParse({ price: 121_000 }).success).toBe(false);
        expect(schema.safeParse({ price: 80_500 }).success).toBe(false);
    });

    it('skips step check when step is 0', () => {
        const fixed = buildBetSchema(180_000, 180_000, 0);
        expect(fixed.safeParse({ price: 180_000 }).success).toBe(true);
    });
});
