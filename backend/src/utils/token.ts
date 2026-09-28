import jwt from "jsonwebtoken";
import { env } from "../env";
import type { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../database/prisma";


interface Payload{
    sub: string;
    email: string;
    role: string;
}

export async function generatedToken(payload: Payload){

    const token = jwt.sign(payload, env.JWT_SECRET, {expiresIn: env.JWT_EXPIRES_IN as string})

    return token

}

export async function  generatedRefreshToken(payload: Payload){

    const RefreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {expiresIn: env.JWT_REFRESH_EXPIRES_IN as string})

    return RefreshToken
    
}

// PARTIMOS DA IDEIA QUE JÁ EXISTE UM REFRESH TOKEN CRIADO NO BANCO DE DADOS

export async function verifiRefreshToken(token: string){

    const tokenVerifed = jwt.verify(token,env.JWT_REFRESH_SECRET) as Payload;
    
    return tokenVerifed

}