import * as Schemas from "./servicesSchema"
import prisma from "../../database/prisma"

interface PaginationParams {
    page?: number;
    limit?: number;
    isActive?: boolean;
}


export async function createService(body: Schemas.ServicesBarberCreateType) {


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

export async function updateService(serviceId: string, body: Schemas.ServicesBarberUpdateType) {
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
        if (dataService.isActive !== undefined) dataUpdate.isActive = dataService.isActive;

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

export async function deleteService(serviceId: string) {
    const serviceExists = await prisma.service.findUnique({where: {id: serviceId}})


    if(!serviceExists) throw new Error("Serviço não encontrado")

        try{
            const serviceDeleted = await prisma.service.update({
                where: {id: serviceId},
                data: {isActive: false}
            })
            return serviceDeleted
        }
        catch(error){
            console.error("Não foi possível deletar o serviço. ERROR: ", error)
            throw new Error("Não foi possível deletar o serviço")
        }
}

export async function listServices({page = 1, limit = 10, isActive = true}: PaginationParams = {}, barbershopId: string) {

    const skip =  (page -1) * limit;

    try{
        const servicesList = await prisma.service.findMany({
            where: { 
                AND: [{ barbershopId }, { isActive }]
            },
            skip,
            take: limit,
            orderBy: {name: 'asc'}
        })
       return servicesList
    }
    catch(error){
        console.error("Não foi possível listar os serviços. ERROR: ", error)
        throw new Error("Não foi possível listar os serviços")
    }
}

export async function searchServices(serviceId?: string, names?: string, barberShopId?: string) {
    if (!serviceId && !names) {
        throw new Error("É necessário informar o ID ou o nome do serviço para realizar a busca");
    }
    
    const orConditions: any[] = [];

    if (serviceId !== undefined) {
        orConditions.push({ id: serviceId });
    }
    
    if (names !== undefined) {
        // Usamos contains e insensitive para uma busca de nome mais flexível
        orConditions.push({ name: { contains: names, mode: 'insensitive' as const } });
    }

    

    if (!barberShopId) {
        throw new Error("O ID da barbearia é obrigatório");
    }

    try {
        const serviceFind = await prisma.service.findFirst({
            where: {
                AND: [{ barbershopId: barberShopId }, { OR: orConditions }]
            }
        });

        return serviceFind;
    } catch (error) {
        console.error("Não foi possível buscar o serviço. ERROR: ", error);
        throw new Error("Não foi possível buscar o serviço");
    }
}