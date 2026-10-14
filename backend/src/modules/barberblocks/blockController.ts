import * as Service from './blockService'
import type { FastifyRequest, FastifyReply } from 'fastify'
import * as Schema from './blockSchema'
import { UserRoles } from '../../middlewares/authorize'


export async function createBlock(req: FastifyRequest, res: FastifyReply){

    const {barberId} = req.query as {barberId: string}
    const targetBarberId = barberId || req.user.barberId
    const body = Schema.blockSchema.parse(req.body)

    if(barberId && barberId !== req.user.barberId && (req.user.role !== UserRoles.SUPER_ADMIN && req.user.role !== UserRoles.ADMIN)){
      return res.status(403).send("Usuario não possui autorização para criar restrições")
    }

    const creattingBlock = await Service.blockCreate(targetBarberId,body)
    return res.status(201).send({status: "Restrição criada com sucesso", data: creattingBlock})
}

export async function listBlocks(req: FastifyRequest, res: FastifyReply){

    const {barberId} = req.query as {barberId: string}
    const targetBarberId = barberId || req.user.barberId
    const listQuery = Schema.blockQuerySchema.parse(req.query)

    if(barberId && barberId !== req.user.barberId && (req.user.role !== UserRoles.SUPER_ADMIN && req.user.role !== UserRoles.ADMIN)){
      return res.status(403).send("Usuario não possui autorização para criar restrições")
    }
    const listtingBlocks = await Service.blockList(targetBarberId,listQuery)
    return res.status(200).send({status:"restrições listadas com sucesso", data: listtingBlocks})
}

export async function desativeBlock(req: FastifyRequest, res: FastifyReply){

    const options = Schema.blockDesativeSchema.parse(req.params)
    if(!options) return res.status(400).send("é necessario enviar o id e opção da restrição")
    
    const desativeBlock = await Service.blockDesative(options)
    return res.status(200).send({status: "Restrição desativada com sucesso", data: desativeBlock})
}