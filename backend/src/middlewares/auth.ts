import jwt from 'jsonwebtoken';
import type {FastifyRequest, FastifyReply} from 'fastify';
import { env } from '../env';
import prisma from '../database/prisma';

export async function authMiddleware(req: FastifyRequest, res: FastifyReply) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).send({error: "token não foi fornecido"});
        return;
    }

    const authToken = authHeader.replace("Bearer ", "");

    try {
     
        const decoded = jwt.verify(authToken, env.JWT_SECRET as string);

           if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "string" ||
      typeof decoded.email !== "string"
    ) {
      return res.status(401).send({
        error: "Payload do token inválido",
      });
    }
        const userAtivated = await prisma.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                status: true,
                role: true,
                
            }
        });

        if (!userAtivated || userAtivated.status !== "ATIVATED") {
            res.status(403).send({error: "Usuário não ativado"});
            return;
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: userAtivated.role as UserRole
        }

        console.log(`usuario autenticado ${req.user.email}`)

    }

    catch (error) {
        res.status(401).send({error: "token inválido"});
    }
}