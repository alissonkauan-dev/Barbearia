import {authorizeMiddleware, UserRoles} from "../../middlewares/authorize"
import { authMiddleware } from "../../middlewares/auth";
import * as ControllerShop from "./barberShopController"
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as ControllerBarber from "../barber/barberController"


export async function shopRoutes(app:FastifyInstance, options: FastifyPluginOptions){


    app.get('/barbearias', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN])]}, ControllerShop.shopList)
    app.put('/barbearia/dados-cadastrais/:id', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])]}, ControllerShop.updateShop)
    app.post('/barberia-nova', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN])]}, ControllerShop.createShop)
    app.put('/barbearia/dados-cadastrais/:id/deleted', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN])]}, ControllerShop.shopDelete )
    app.get('/barbearia/:id/barbeiros', { 
        preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])] 
    }, ControllerBarber.listBarber);
}