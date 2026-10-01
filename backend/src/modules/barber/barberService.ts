import * as BarberSchema from "./barberSchema"
import prisma from "../../database/prisma"
import bcrypt from "bcryptjs"
import {barberUpdateSchema} from "./barberSchema"



interface PaginationParams {
    page?: number;
    limit?: number;
    isActived?: boolean;
    barberShopId?: string;
}

export async function barberCreate(body: BarberSchema.barberCreateSchemaDto){

    const userExisted = await prisma.user.findFirst({where: {email: body.email}})
    if(userExisted) throw new Error("Usuario já cadastrado")

    const shopExisted = await prisma.barbershop.findFirst({where: {slug: body.barbershopSlug}})
    if(!shopExisted) throw new Error("Barbearia não encontrada")

    try{
        const passwordHashed = await bcrypt.hash(body.password,12)

        const barberCreated = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    passwordHash: passwordHashed,
                    phone: body.phone,
                    role: "BARBER",
                    barbershopId: shopExisted.id
                }
            })
            const newBarber = await tx.barber.create({
                data: {
                    userId: newUser.id,
                    barbershopId: shopExisted.id,
                    bio: body.bio,
                    photoUrl: body.photoUrl
                }
            })
            return {...newBarber, newUser}
        })
        return barberCreated
    }
    catch(error){
        console.error("Error ao criar o barbeiro. Error: ", error)
        throw new Error("Não foi possivel cadastrar o barbeiro")
    }
}

export async function barberUpdate(barberId: string, body: unknown){

    const barberExisted = await prisma.barber.findFirst({where: {id: barberId}});

    if(!barberExisted) throw new Error("Barbeirio não encontrado")

    try{

        const data = barberUpdateSchema.parse(body)

        const barberUpdate: any = {}
        const userUpdate: any = {}

        if(data.name !== undefined) userUpdate.name = data.name;
        if(data.phone !== undefined) userUpdate.phone = data.phone;
        if(data.email !== undefined) userUpdate.email =  data.email;
        if(data.password !== undefined) userUpdate.passwordHash = await bcrypt.hash(data.password,12);
        
        if(data.bio !== undefined) barberUpdate.bio = data.bio
        if(data.photoUrl !== undefined) barberUpdate.photoUrl = data.photoUrl
        if(data.barbershopSlug !== undefined){
           const shopBarberId = await prisma.barbershop.findFirst({
            where: {slug: data.barbershopSlug},
            select: {
                id: true,
                }
            })
            if(!shopBarberId) throw new Error("Barbearia não encontrada");
            barberUpdate.barbershopId = shopBarberId.id            
        }
        if (data.isActive !== undefined) barberUpdate.isActive = data.isActive;
        
        const updatedBarber = await prisma.$transaction( async (tx) => {

            if(Object.keys(userUpdate).length > 0){
                await tx.user.update({
                where: {id: barberExisted.userId},
                data: userUpdate
                });
            }

            if(Object.keys(barberUpdate).length > 0){
                await tx.barber.update({
                    where: {id: barberExisted.id},
                    data: barberUpdate,
                });
            }

            return await prisma.barber.findUnique({
                where: {id: barberExisted.id },
                include: {user: true}
            })
            
        })

        const {passwordHash, ...userWithoutPassword} = updatedBarber!.user;

        return { ...updatedBarber, user: userWithoutPassword}

    }
    catch(error){
        console.error("Error na atualização do cadastro do barbeiro. Error: ",error)
        throw new Error("Não foi possivel atualizar os dados do barbeiro")
    }
    
}

export async function barberList({ page = 1, limit = 10, isActived = true }: PaginationParams = {}, shopId: string) {
    const skip = (page - 1) * limit;

    const barberOfBarberShop = await prisma.barber.findMany({
        where: {
            AND: [
                { isActive: isActived },
                { barbershopId: shopId }
            ]
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            bio: true,
            photoUrl: true,
            isActive: true,
            createdAt: true,
            barbershopId: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    status: true,
                    role: true
                }
            }
        }
    });

    return barberOfBarberShop;
}

export async function barberDelete(barberId: string){

    const barberExistent = await prisma.barber.findUnique({
        where: {id: barberId}
    })

    if(!barberExistent) throw new Error("Não foi possivel localizar o barbeiro")

    try {
        
     const barberDesative = await prisma.$transaction(async (tx) =>{

        await tx.user.update({
            where: {id: barberExistent.userId},
            data: {status: 'INACTIVE'}
        })

        const desativeBarber = await tx.barber.update({
            where: {id: barberExistent.id},
            data: {isActive: false},
            select: {
                id: true,
                userId: true,
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return desativeBarber

     })

        return {message:`Barbeiro: ${barberDesative.user.name} foi desativado com sucesso`}

    }
    catch(error){
        console.error("Erro na desativação do usuario. Error: ", error)
        throw new Error("Não foi possivel desativar o barbeiro")
    }
}