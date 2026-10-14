import { z } from 'zod';

export const dashboardQuerySchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    barberId: z.string().optional()
});

export type DashboardQueryType = z.infer<typeof dashboardQuerySchema>;