import * as Controller from './servicesController'
import type { FastifyInstance } from 'fastify'
import {authMiddleware} from '../../middlewares/auth'
import {authorizeMiddleware, UserRoles} from '../../middlewares/authorize'


export async function servicesRoutes(app: FastifyInstance) {

    
    app.post('/services/create', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])]}, Controller.createService)
    app.patch('/services/:serviceId/update', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])]}, Controller.updateService)
    app.patch('/services/:serviceId/inactivate', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])]}, Controller.deleteService)
}