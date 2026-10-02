import * as Schemas from "./servicesSchema"
import prisma from "../../database/prisma"



export async function createService(body: Schemas.ServicesBarberCreateSchema) {


    const serviceExists = await prisma.service.findFirst({
        where: {
            AND: [{ name: body.name }, { barbershopId: body.barbershopId }]
        }
    })

    if(serviceExists){
        throw new Error("Serviço já existe para essa barbearia")
    }

    try{

    const dataService = Schemas.servicesBarberCreateSchema.parse(body) 

        const serviceCreated = await prisma.service.create({
            data: {
                name: dataService.name,
                description: dataService.description,
                price: dataService.price,
                durationMin: dataService.duration,
                barbershopId: dataService.barbershopId
            }
        })

        return serviceCreated
    }

    catch(error){
        console.error("Não foi possivel criar o serviço. ERROR: ", error)
        throw new Error("Não foi possivel cadastrar o serviço")
    }
}

export async function updateService(serviceId: string, body: Schemas.ServicesBarberUpdateSchema) {
    const dataService = Schemas.servicesBarberUpdateSchema.parse(body)

    const serviceExists = await prisma.service.findUnique({where: {id: serviceId}})

    if(!serviceExists){
        throw new Error("Serviço não encontrado")
    }

    try{
        const dataUpdate: any = {};

        if (dataService.name !== undefined) dataUpdate.name = dataService.name;
        if (dataService.description !== undefined) dataUpdate.description = dataService.description;
        if (dataService.price !== undefined) dataUpdate.price = dataService.price;
        if (dataService.duration !== undefined) dataUpdate.durationMin = dataService.duration;

        const serviceUpdated = await prisma.service.update({
            where: { id: serviceId },
            data: dataUpdate
        })
        return serviceUpdated
    }
    catch(error){
        console.error("Não foi possível atualizar o serviço. ERROR: ", error)
        throw new Error("Não foi possível atualizar o serviço")
    }

}