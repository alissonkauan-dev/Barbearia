import { barberListQuerySchema } from "./barberSchema";
import * as BarberService from "./barberService"
import type { FastifyRequest, FastifyReply } from "fastify";


export async function createBarber(req: FastifyRequest, res: FastifyReply){

    const createdBarber = await BarberService.barberCreate(req.body as any)
    res.status(201).send({status: "Barbeiro criado com sucesso", data: createdBarber})

}

export async function updateBarber(req: FastifyRequest, res: FastifyReply) {
    const {barberId} = req.query as {barberId: string}
    const targetBarberId = barberId || req.user.barberId;

    if(targetBarberId !== req.user.barberId && (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN")){
        return res.status(403).send("Usuario não tem permissão para atualizar outro barbeiro")
    }

    const updatedBarber =  await BarberService.barberUpdate(targetBarberId,req.body)
    res.status(200).send({status: "Cadastro atualizado", data: updatedBarber})

}

export async function listBarber(req: FastifyRequest, res: FastifyReply){
    const BarberListQuery = barberListQuerySchema.parse(req.query)

    const {id} = req.params as {id:string}

   if (
    req.user.role !== "SUPER_ADMIN" &&
    req.user.barbershopId !== id
) {
    return res.status(403).send(
        "Usuário não tem permissão para acessar as informações de outra barbearia"
    );
}

    const listedBarber = await BarberService.barberList(BarberListQuery, id)
    res.status(200).send({status: "Lista gerada com sucesso",  data: listedBarber})
}


export async function deleteBarber(req: FastifyRequest, res: FastifyReply){
     const {barberId} = req.query as {barberId: string}
    const targetBarberId = barberId || req.user.barberId;

    if(targetBarberId !== req.user.barberId && (req.user.role !== "SUPER_ADMIN" && req.user.role !== "ADMIN")){
        return res.status(403).send("Usuario não tem permissão para atualizar outro barbeiro")
    }
    const barberDeleted = await BarberService.barberDelete(targetBarberId)
    res.status(200).send({status: "Barbeiro deletado com sucesso", data: barberDeleted})
}