import { z } from "zod";

export const dayOfWeekEnum = z.enum([
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
]);

export const businessHourUpsertSchema = z.object({
    dayOfWeek: dayOfWeekEnum,
    isOpen: z.boolean(),
    openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "O formato da hora deve ser HH:mm").optional().nullable(),
    closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "O formato da hora deve ser HH:mm").optional().nullable(),
});

export type BusinessHourUpsertType = z.infer<typeof businessHourUpsertSchema>;