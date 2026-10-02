import {z} from "zod"

export const servicesBarberCreateSchema = z.object({
    name: z.string().min(3, "O nome do serviço deve ter no mínimo 3 caracteres"),
    description: z.string().optional().default("Sem descrição"),
    price: z.number().min(1, "O preço do serviço deve ser maior que 0"),
    duration: z.number().min(1, "A duração do serviço deve ser maior que 0"),
    barbershopId: z.string("O ID da barbearia deve ser um UUID válido"),
})

export const servicesBarberUpdateSchema = z.object({
    name: z.string().min(3, "O nome do serviço deve ter no mínimo 3 caracteres").optional(),
    description: z.string().optional(),
    price: z.number().min(1, "O preço do serviço deve ser maior que 0").optional(),
    duration: z.number().min(1, "A duração do serviço deve ser maior que 0").optional(),
})


export type ServicesBarberCreateSchema = z.infer<typeof servicesBarberCreateSchema>
export type ServicesBarberUpdateSchema = z.infer<typeof servicesBarberUpdateSchema>