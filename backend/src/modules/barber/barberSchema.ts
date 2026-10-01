import { z } from "zod"

export const barberCreateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.email("E-mail inválido"),
    password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
    phone: z.string().min(11, "Mínimo de 11 caracteres para o telefone"),
    barbershopSlug: z.string(),
    bio: z.string().optional(),
    photoUrl: z.url("URL da foto inválida").optional(),
})

export const barberUpdateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").optional(),
    phone: z.string().min(11, "Mínimo de 11 caracteres para o telefone").optional(),
    email: z.email("E-mail invalido").optional(),
    password: z.string().min(6, 'minimo de seis caracteres').optional(),
    age: z.string().optional(),
    barbershopSlug: z.string().optional(),
    bio: z.string().optional(),
    photoUrl: z.string().optional(),
    isActive: z.boolean().optional(),
})

export const barberListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    isActive: z.coerce.boolean().optional(),

});

export type barberCreateSchemaDto = z.infer<typeof barberCreateSchema>
export type barberUpdateSchemaDto = z.infer<typeof barberUpdateSchema>
export type barberListQuerySchemaDto = z.infer<typeof barberListQuerySchema>