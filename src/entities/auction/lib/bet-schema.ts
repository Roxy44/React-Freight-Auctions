import { z } from 'zod';

export type BetFormValues = {
    price: number;
};

/** Zod schema for place/edit bet form. min/max/step come from detail pricing DTO. */
export function buildBetSchema(min?: number | null, max?: number | null, step?: number | null) {
    return z.object({
        price: z
            .number({ error: 'Укажите цену' })
            .positive('Цена должна быть больше 0')
            .superRefine((value, ctx) => {
                if (min != null && value < min) {
                    ctx.addIssue({ code: 'custom', message: `Минимум: ${min}` });
                }
                if (max != null && value > max) {
                    ctx.addIssue({ code: 'custom', message: `Максимум: ${max}` });
                }
                if (step != null && step > 0 && min != null) {
                    const steps = (value - min) / step;
                    if (Math.abs(steps - Math.round(steps)) > 1e-8) {
                        ctx.addIssue({ code: 'custom', message: `Шаг ставки: ${step}` });
                    }
                }
            }),
    });
}
