import type { FastifyRequest, FastifyReply } from "fastify";
import * as Service from "./usuarioService"
import { UserRoles } from "../../middlewares/authorize";



export async function userCreate(req: FastifyRequest, res: FastifyReply){

    const userCreate = await Service.createUser(req.body as any)
    res.status(201).send({status: " Usuario criado com sucesso: ", data: userCreate.name})

}

export async function userLogin(req: FastifyRequest, res: FastifyReply){
    const login = await Service.loginUser(req.body as any)

    res.setCookie("refreshToken", login.RefreshTokenGenerated, {
    path: "/",
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60
    })
    res.status(201).send({status: "Usuario Logado: ", 
        data: {
            user: { id: login.id, 
                    name: login.name, 
                    email: login.email, 
                    role: login.role},
            accessToken: login.tokenGenerated
    }})
}

export async function listUsers(req: FastifyRequest, res: FastifyReply) {
    const userFind = await Service.listUser()
    res.status(201).send({status:"Usuarios Listados com Sucesso", data: userFind })
}

export async function deleteUser(req: FastifyRequest, res: FastifyReply){

    const userParams = req.query as {userId?: string};
    const targetUserId = userParams.userId || req.user.id;

    if(targetUserId !== req.user.id && req.user.role !== UserRoles.ADMIN){
        return res.status(403).send({status:"Usuario não tem permissão para deletar outro usuario"})
    }

    const userDeleted = await Service.deleteMyUser(targetUserId)
    res.status(200).send({status: "usuario deletado com sucesso: ", data: userDeleted})
}

export async function updateUser(req: FastifyRequest, res: FastifyReply){
    const userParams = req.query as {userId?: string};
    const targetUserId =  userParams.userId || req.user.id;

    if(targetUserId !== req.user.id  && req.user.role !== UserRoles.ADMIN){
        return res.status(403).send("Usuario não tem permissão para atualizar informações de  outro Usuario")
    }

    const userUpdeted = await Service.updateUser(targetUserId, req.body)
    res.status(200).send({status: "Usuario atualizado com sucesso", data: userUpdeted})
}

export async function findAppointments(req: FastifyRequest, res: FastifyReply){

    const paginationParams = req.query as {page?: number, limit?: number, userId?: string};
    const targetUserId = paginationParams.userId || req.user.id

    if(targetUserId !== req.user.id && req.user.role !== UserRoles.ADMIN){
        return res.status(403).send({status: "Usuario não possiu permissão para ver os agendamentos de outro Cliente"})
    }

    const appointmentsFound = await Service.findMyAppointments(paginationParams, targetUserId)

    res.status(200).send({status: "Agendamentos listados com sucesso", data: appointmentsFound})
}

export async function handlerCookiesToken(req: FastifyRequest, res: FastifyReply){

    const oldRefreshToken = req.cookies.refreshToken

    if(!oldRefreshToken){
        return res.status(401).send({
            status:"Error",
            message: "Refresh token nao encontrado"
        })
    }

    try{

        const tokenAtualizado = await Service.refreshToken(oldRefreshToken)
        return res.status(200).send({status: "Token atualizado", data: tokenAtualizado})

    }
    catch(error){
        console.error("Error na atualização do token: ", error)
        throw new Error("Não foi possivel atualizar o token")
    }
}