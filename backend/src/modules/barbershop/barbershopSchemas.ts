import {z} from "zod"

export const barberShopCreateSchema = z.object({
    name: z.string().min(12, "minimo de doze caracteres"),
    slug: z.string().min(6, "minimo de seis caracteres"),
    document: z.string(),
    phone: z.string().min(11, "minimo de onze caracteres"),
    email: z.email("E-mail inválido"),
    street: z.string(),
    number: z.string(),
    state: z.string(),
    zipCode: z.string(),
    timeZone: z.string()
}) 

export const barberShopUpdateSchema = z.object({
    name: z.string().min(12, "minimo de doze caracteres").optional(),
    slug: z.string().min(6, "minimo de seis caracteres").optional(),
    document: z.string().optional(),
    phone: z.string().min(11, "minimo de onze caracteres").optional(),
    email: z.email("E-mail inválido").optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    timeZone: z.string().optional(),
    logoUrl: z.string().optional(),
    isActive: z.boolean().optional()
})

export type barberShopCreateSchemaDto = z.infer<typeof barberShopCreateSchema>
export type barberShopUpdateSchemaDto = z.infer<typeof barberShopUpdateSchema>


