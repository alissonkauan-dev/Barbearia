import * as shop from "./barbershopSchemas"
import prisma from "../../database/prisma"
import {z} from "zod"


interface PaginationsParams {
    page?: number;
    limit?: number;
    isActived?: boolean;
}

export async function barberShopCreate(body: shop.barberShopCreateSchemaDto){

const barberShopExisted = await prisma.barbershop.findFirst({where: {name: body.name}})

if (barberShopExisted){
    throw new Error("Barbearia já existe")
}

try {

        const barberShopCreated = await prisma.barbershop.create({
            data: {
                name: body.name,
                slug: body.slug,
                phone: body.phone,
                document: body.document,
                email: body.email,
                street: body.street,
                number: body.number,
                state: body.state,
                zipCode: body.zipCode,
                timezone: body.timeZone,

            }
        })

        return barberShopCreated
}
catch(error){
    console.error("Não foi possivel criar a barbearia. ERROR: ", error)
    throw new Error("Não foi possivel cadastrar a barbearia")

}


}

export async function barberShopUpdate(shopId: string, body: unknown){


    const barberShopExisted = await prisma.barbershop.findUnique({where: {id: shopId}})

    if(!barberShopExisted){
        throw new Error("Barbearia não encontrada")
    }

    try {
        const data = shop.barberShopUpdateSchema.parse(body);

        const dataUpdate: any = {};

        if (data.name !== undefined) dataUpdate.name = data.name;
        if (data.slug !== undefined) dataUpdate.slug = data.slug;
        if (data.document !== undefined) dataUpdate.document = data.document;
        if (data.phone !== undefined) dataUpdate.phone = data.phone;
        if (data.email !== undefined) dataUpdate.email = data.email;
        if (data.street !== undefined) dataUpdate.street = data.street;
        if (data.number !== undefined) dataUpdate.number = data.number;
        if (data.state !== undefined) dataUpdate.state = data.state;
        if (data.zipCode !== undefined) dataUpdate.zipCode = data.zipCode;
        if (data.timeZone !== undefined) dataUpdate.timeZone = data.timeZone;
        if (data.logoUrl !== undefined) dataUpdate.logoUrl = data.logoUrl;
        if (data.isActive !== undefined) dataUpdate.isActive = data.isActive;

        const barberShopUpdated = await prisma.barbershop.update({
            where: { id: barberShopExisted.id },
            data: dataUpdate
        });

        return barberShopUpdated;
    }

    catch(error){
        console.error("Barbearia não atualizada. Error: ", error);
        throw new Error("Não foi possivel atualizar a barbearia");
    }

}

export async function barberShopDelete(shopId: string){

  const barberShopExisted = await prisma.barbershop.findUnique({where: {id: shopId}})

    if(!barberShopExisted){
        throw new Error("Barbearia não encontrada")
    }

 try{

    await prisma.barbershop.update({
        where: {id: barberShopExisted.id},
        data: {isActive: false}
    })

    return { message: "Barbearia desativada com sucesso para preservar o histórico", data: barberShopExisted };
 }
catch(error){
    console.error("Barbearia não deletado. Error: ", error)
    throw new Error("Não foi possivel deletar a barbearia")
}

}

export async function barberShopList({page = 1, limit = 10, isActived = true}: PaginationsParams = {} ){

    const skip = (page - 1) * limit;

    try {

        const barberShopFound = await prisma.barbershop.findMany({
            where: {isActive: isActived},
            take: limit,
            skip,
            orderBy: {
                name: 'asc'
            }
        })

        return barberShopFound;

    }
    catch(error){
        console.error("Barbearias não listadas. Error: ", error);
        throw new Error("Não foi possivel listar as Barbearias")
    }

}