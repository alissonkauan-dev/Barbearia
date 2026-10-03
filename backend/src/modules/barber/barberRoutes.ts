import * as Controller from "./barberController"
import type { FastifyInstance } from "fastify";
import {authorizeMiddleware, UserRoles} from "../../middlewares/authorize";
import { authMiddleware } from "../../middlewares/auth";


export async function barberRoutes(app: FastifyInstance) {

app.post("/barber/create", {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])]}, Controller.createBarber)
app.patch("/barber/update/:barberId", {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])]}, Controller.updateBarber)
app.get("/barber/list", {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])]}, Controller.listBarber)
app.patch("/barber/delete/:barberId", {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])]}, Controller.deleteBarber)

}