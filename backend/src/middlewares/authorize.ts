import type {FastifyRequest, FastifyReply} from "fastify";
import {authMiddleware} from "./auth";


export enum UserRoles {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  CLIENTE = "CLIENTE",
  BARBEIRO = "BARBEIRO",
}

export function authorizeMiddleware (allowedRoles: UserRoles[]) {

   return async function (req: FastifyRequest, res: FastifyReply){

    await authMiddleware(req,res);

    if(res.sent){
        return;
    }
    
    if (!req.user) {
      return res.status(401).send({
        error: "Usuário não autenticado",
      });
    }

   if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({
        error: "Você não tem permissão para acessar este recurso",
      });
    }

   }
    
}

export default authorizeMiddleware;
