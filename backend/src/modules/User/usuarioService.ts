import { usuarioUpdateSchema, type usuarioSchema } from "./usuarioSchema";
import * as schema from "./usuarioSchema"
import prisma from "../../database/prisma";
import bcrypt from "bcryptjs";
import * as token from "../../utils/token"
import jwt from "jsonwebtoken";

interface USER {
    email: string;
    password: string;
}

interface PaginationParams {
    page?: number;
    limit?: number;
}

export async function createUser(body: schema.CreateUserDto) {

    const userExistent = await prisma.user.findFirst({ where: { email: body.email } })

    if (userExistent) {
        throw new Error("Usuaria já existente")
    }

    const passwordHashed = await bcrypt.hash(body.password, 12)

    try {

        const usuarioCreated = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                passwordHash: passwordHashed,
                phone: body.phone
            }
        })

        return usuarioCreated
    }

    catch (error) {
        throw new Error("Não foi possivel criar o usuario")
    }

}

export async function loginUser(login: USER) {

    const usuarioExistent = await prisma.user.findFirst({ where: { email: login.email } })

    if (!usuarioExistent || (usuarioExistent.status == "INACTIVE" || usuarioExistent.status == "BLOCKED")) {
        throw new Error("Usuario ou Senha Invalidos")
    }

    const passwordDecoded = await bcrypt.compare(login.password, usuarioExistent.passwordHash)

    if (!passwordDecoded) {
        throw new Error("Usuario ou Senha invalidos")
    }

    const payload = {
        sub: usuarioExistent.id,
        email: usuarioExistent.email,
        role: usuarioExistent.role
    }

    const tokenGenerated = await token.generatedToken(payload);

    const RefreshTokenGenerated = await token.generatedRefreshToken(payload);
    const decodedToken = await jwt.decode(RefreshTokenGenerated) as {exp: number};
    const expiresAT = new Date(decodedToken.exp * 1000)

    await prisma.refreshToken.create({
        data: {
            tokenHash: RefreshTokenGenerated,
            userId: usuarioExistent.id,
            expiresAt: expiresAT
        }
    })

    const { passwordHash, ...userWithoutPassword } = usuarioExistent;

    return { ...userWithoutPassword, tokenGenerated, RefreshTokenGenerated }



}


export async function deleteMyUser(userId: string) {

    const userExisted = await prisma.user.findUnique({ where: { id: userId } })

    if (!userExisted) {
        throw new Error("Usuario não cadastrado")
    }

    try {

        const userDeleted = await prisma.user.delete({ where: { id: userExisted.id } })
        return { message: `Usuario: ${userExisted.name} foi deletado com suscesso` };
    }

    catch (error) {
        throw new Error("Não foi possivel deleta o usuario")
    }

}

export async function listUser( {page = 1, limit = 10}: PaginationParams = {}) {

    const skip = (page - 1) * limit;

    try {
        
        const users = await prisma.user.findMany(
    
            { 
                select: {
                    id:true,
                    name:true,
                    email:true,
                    age:true
                 },
                 skip,
                 take: limit,
                 orderBy:{
                    name: 'asc'
                 }
        }
    )
        return users 
    }
    catch (error) {
    console.error('Erro ao listar usuários:', error);
    throw new Error('Não foi possível recuperar a lista de usuários.');
  }
}

export async function updateUser(userId: string, body: unknown) {
    
    const data = usuarioUpdateSchema.parse(body);

    const usuarioExistent = await prisma.user.findUnique({ where: { id: userId } })

    if (!usuarioExistent) {
        throw new Error("Usuario ou Senha Invalidos")
    }

    try {

    const dataUpdate: {
        name?: string;
        email?: string;
        passwordHash?: string;
        age?: string;
        phone?: string;
        status?: ("ACTIVE" | "INACTIVE" | "BLOCKED");
        isBarbeiro?: string;
        isClient?: string;
        note?: string;
        bio?: string;

    } = {}

    if (data.name !== undefined) {
        dataUpdate.name = data.name;
    }
    if (data.email !== undefined) {
        dataUpdate.email = data.email;
    }
    if (data.password !== undefined) {
        dataUpdate.passwordHash = await bcrypt.hash(data.password,12)
    }
    if (data.phone !== undefined) {
        dataUpdate.phone = data.phone;
    }
    if (data.status !== undefined) {
        dataUpdate.status = data.status;
    }
    if (usuarioExistent.role === "CLIENT") {

        if (data.age !== undefined) {
            dataUpdate.age = data.age
        }

        if (data.note !== undefined) {
            dataUpdate.note = data.note;
        }
    }

    if (usuarioExistent.role == "BARBER") {
        if (data.bio !== undefined) {
            dataUpdate.bio = data.bio;  
        }
    }

    const userUpdated = await prisma.user.update({
        where: { id: userId },
        data: dataUpdate,
    });

    const { passwordHash, ...userWithoutPassword} = userUpdated

    return userWithoutPassword
}
    catch(error){
        console.error("Não foi possivel alterar as informações devido ao Error: ", error)
        throw new Error("Não foi possivel alterar as informações")
    }

}

export async function findMyAppointments({page = 1, limit = 10}: PaginationParams = {}, userId: string){

    const skip = (page - 1 ) * limit;


    try{
    const appointmentsFind = await prisma.appointment.findMany({
        where: {clientId: userId},
        select: {
            id: true,
            barberId: true,
            barbershopId: true,
            serviceId: true
        },
        skip,
        take: limit,
        orderBy:{
            createdAt: "desc"
        }

        })

    return appointmentsFind

    }
    catch(error){
        console.error("Error ao lista o agendamento: ", error)
        throw new Error("Não foi possivel lista os agendamentos do usuario")
    }
}

export async function refreshToken(oldRefreshToken: string){

    if(!oldRefreshToken){
        throw new Error("Refresh token nao foi encontrado")
    }

    try {
        const decoded = await token.verifiRefreshToken(oldRefreshToken);

        const storedToken = await prisma.refreshToken.findUnique(
            {where: {tokenHash: oldRefreshToken} }
        )

        if(!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()){
            throw new Error("Usuario foi deslogado ou token invalido")
        }

        const payload = {
            sub: decoded.sub,
            email: decoded.email,
            role: decoded.role
        }

        const newAcessToken = await token.generatedToken(payload)

        return { accessToken: newAcessToken};
    }
    catch(error){
        console.error("Error na validação do token: ", error)
        throw new Error("Error de revalidação de login")
    }

}