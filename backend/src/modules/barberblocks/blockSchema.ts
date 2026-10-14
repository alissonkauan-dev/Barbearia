
import {z} from 'zod'

const booleanString = z.union([
    z.boolean(),
    z.string().trim().toLowerCase().refine((value) => ["true", "false", "1", "0", "yes", "no", "on", "off"].includes(value), {
        message: "Valor booleano inválido",
    }).transform((value) => ["true", "1", "yes", "on"].includes(value))
])

export const blockSchema = z.object({
    title: z.string().min(6,"minimo seis caracteres"),
    type: z.enum(["BREAK","LUNCH","PERSONAL", "MAINTENANCE", "OTHER"]),
    reason: z.string().optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date()
})

export const blockDesativeSchema = z.object({
    blockId: z.string(),
    isActive: booleanString
})

export const blockQuerySchema = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number()
})


export type blockSchemaType = z.infer<typeof blockSchema>
export type blockDesativeSchemaType = z.infer<typeof blockDesativeSchema>
export type blockQuerySchemaType = z.infer<typeof blockQuerySchema>