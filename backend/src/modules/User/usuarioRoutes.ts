import {authorizeMiddleware, UserRoles} from "../../middlewares/authorize";
import { authMiddleware } from "../../middlewares/auth";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as Controller from "./usuarioController"



export async function userRoutes(app: FastifyInstance, options: FastifyPluginOptions){

app.post('/criar', Controller.userCreate);
app.post('/login', Controller.userLogin);
app.post('/refresh', Controller.handlerCookiesToken)
app.patch('/atualizar', {preHandler: [authMiddleware]}, Controller.updateUser);
app.get('/listar', { preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN]) ] }, Controller.listUsers)
app.get('/lista-agendamentos', {preHandler: [authMiddleware]}, Controller.findAppointments)
app.patch('/delete', {preHandler: [authMiddleware]}, Controller.deleteUser)

}
