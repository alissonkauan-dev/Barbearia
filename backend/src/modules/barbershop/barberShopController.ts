import * as ServiceShop from "./barberShopService"
import type { FastifyReply, FastifyRequest } from "fastify"
import { barberShopCreateSchema, barberShopUpdateSchema } from "./barbershopSchemas"


export async function createShop(req: FastifyRequest, res: FastifyReply){
    const shop = barberShopCreateSchema.parse(req.body)
    const shopCreated = await ServiceShop.barberShopCreate(shop)
    return res.status(201).send({status:" Barbearia Criada com Sucesso", data: shopCreated})
}

export async function updateShop(req: FastifyRequest, res: FastifyReply){
    const {id} = req.params as {id: string}
    const shop = barberShopUpdateSchema.parse(req.body)
    const shopUpdate = await ServiceShop.barberShopUpdate(id, shop)
    return res.status(200).send({status: "Informações da barbearia atualizada", data: shopUpdate})
}

export async function shopDelete(req: FastifyRequest, res: FastifyReply){

    const {id} = req.params as {id: string}
    const shopInativo = await ServiceShop.barberShopDelete(id)
    return res.status(200).send({status: "Barbearia desativada com sucesso", data: shopInativo})

}

export async function shopList(req: FastifyRequest, res: FastifyReply){

    const listParams = req.query as {page?:number, limit?:number, isActive?:boolean}
    const shopLista = await ServiceShop.barberShopList(listParams)
    return res.status(200).send({status: "Barbearias listadas com sucesso", data: shopLista})

}