import {authorizeMiddleware, UserRoles} from "../../middlewares/authorize"
import { authMiddleware } from "../../middlewares/auth";
import * as ControllerShop from "./barberShopController"
import type { FastifyInstance, FastifyPluginOptions } from "fastify";



export async function shopRoutes(app:FastifyInstance, options: FastifyPluginOptions){


    app.get('/barbearias', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN])]}, ControllerShop.shopList)
    app.put('/:id/dados-cadastrais', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.BARBEIRO])]}, ControllerShop.updateShop)
    app.post('/barberia-nova', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN])]}, ControllerShop.createShop)
    app.put('/:id/dados-cadastrais/deleted', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN])]}, ControllerShop.shopDelete )
}