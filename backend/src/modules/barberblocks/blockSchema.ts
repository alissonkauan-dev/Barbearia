
import {z} from 'zod'


export const blockSchema = z.object({
    title: z.string().min(6,"minimo seis caracteres"),
    type: z.enum(["BREAK","LUNCH","PERSONAL", "MAINTENANCE", "OTHER"]),
    reason: z.string().optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date()
})

export const blockDesativeSchema = z.object({
    blockId: z.string(),
    isActive: z.coerce.boolean()
})

export const blockQuerySchema = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number()
})


export type blockSchemaType = z.infer<typeof blockSchema>
export type blockDesativeSchemaType = z.infer<typeof blockDesativeSchema>
export type blockQuerySchemaType = z.infer<typeof blockQuerySchema>