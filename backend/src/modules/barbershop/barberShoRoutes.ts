import {authorizeMiddleware, UserRoles} from "../../middlewares/authorize"
import { authMiddleware } from "../../middlewares/auth";
import * as ControllerShop from "./barberShopController"
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import * as ControllerBarber from "../barber/barberController"
import * as ControllerService from "../services/servicesController"

export async function shopRoutes(app:FastifyInstance, options: FastifyPluginOptions){

    app.get('/barbearia/:barbershopId/Services', {preHandler: [authMiddleware]}, ControllerService.listServices)
    app.get('/barbearias', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN])]}, ControllerShop.shopList)
    app.get('/barbearia/:barbershopId/barbeiros', { preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])]}, ControllerBarber.listBarber);
    app.get('/barbearia/:barbershopId/services/search', {preHandler: [authMiddleware]}, ControllerService.searchServices)
    

    app.patch('/barbearia/dados-cadastrais/:barbershopId', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN, UserRoles.ADMIN])]}, ControllerShop.updateShop)
    app.post('/barberia-nova', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN])]}, ControllerShop.createShop)
    app.patch('/barbearia/dados-cadastrais/:barbershopId/deleted', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.SUPER_ADMIN])]}, ControllerShop.shopDelete )
}