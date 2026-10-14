import * as Schema from './blockSchema'
import prisma from "../../database/prisma";

interface PaginationParamns {
    page: number
    limit: number
}


export async function blockCreate(barberId: string, body: Schema.blockSchemaType){

    const data = Schema.blockSchema.parse(body)
    const now = new Date
    const barberExistent = await prisma.barber.findUnique({
        where: {id: barberId}
    })

    if(!barberExistent) throw new Error("Não foi possivel localizar o barbeiro")
    if(data.startAt >= data.endAt) throw new Error("data de inicio maior ou igual a data de termino da restrição")
    if (data.startAt < now) throw new Error("O horário de início deve ser maior que o horário atual");
    if (data.endAt < now) throw new Error("O horário de término deve ser maior que o horário atual");

    try{

      const barberCreated = await prisma.barberBlock.create({
            data: {
                barberId: barberId,
                type: data.type,
                reason: data.reason,
                title: data.title,
                startAt: data.startAt,
                endAt: data.endAt
            }
        })
        return barberCreated
    }
    catch(error){
        console.error("Error na criação do block. Error: ", error)
        throw new Error("não foi possivel cadastrar a restrição")
    }

}

export async function blockList(barberId: string, {page = 1, limit = 10}: PaginationParamns){
    
    const skip = (page - 1) * limit
    const barberExistent = await prisma.barber.findUnique({
        where: {id: barberId}
    })
    if(!barberExistent) throw new Error("Não foi possivel localizar o barbeiro")

    try{

        const blocksFind = await prisma.barberBlock.findMany({
            where: {barberId: barberId},
            take: limit,
            skip,
            orderBy: {createdAt: 'asc'}
        })
        return blocksFind
    }
    catch(error){
        console.error("Error em lista as retrições. Error: ", error)
        throw new Error("Não foi possivel listar as restrições existentes")
    }


}
export async function blockDesative(body: Schema.blockDesativeSchemaType){

    const desativeOptions = Schema.blockDesativeSchema.parse(body)
    const blockExistent = await prisma.barberBlock.findUnique({
        where: {id: desativeOptions.blockId}
    })

    if(!blockExistent) throw new Error("Não foi possivel localizar a restrição")
    
    try{

        const desativedBlock = await prisma.barberBlock.update({
            where: {id: desativeOptions.blockId},
            data: {isActive: desativeOptions.isActive}
        })
        
        return desativedBlock
    }
    catch(error){
        console.error("Error na desativação da restrição. Error: ", error)
        throw new Error("Não foi possivel desativa a restrição")
    }

}
