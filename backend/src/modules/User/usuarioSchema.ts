import {z} from "zod"


export const usuarioSchema = z.object({
    name: z.string().min(6, "minimo de seis caracteres"),
    email: z.email(),
    password: z.string().min(6, "minimo de seis caracteres para senha"),
    phone: z.string().min(10, "seu numero está errado").max(12, "seu numero não é valido")
})

export const usuarioUpdateSchema = z.object({
    name: z.string().min(6, "minimo de seis caracteres").optional(),
    email: z.email().optional(),
    password: z.string().min(6, "minimo de seis caracteres para senha").optional(),
    phone: z.string().min(10, "seu numero está errado").max(12, "seu numero não é valido").optional(),
    status:z.enum( ["ACTIVE",  "INACTIVE", "BLOCKED"]).optional(),
    age: z.string().optional(),
    note: z.string().min(6, "minimo de seis caracteres para o observação").optional(),
    bio: z.string().min(6, "minimo de seis caracteres para a bio").optional()

})

export type CreateUserDto = z.infer<typeof usuarioSchema>
export type UpdateUserDto = z.infer<typeof usuarioUpdateSchema>


