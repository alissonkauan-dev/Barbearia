import * as Controller from './blockController'
import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../middlewares/auth'
import { authorizeMiddleware, UserRoles } from '../../middlewares/authorize'

export async function blockRoutes(app: FastifyInstance) {

    app.post('/blocks', { 
        preHandler: [authMiddleware, authorizeMiddleware([UserRoles.BARBER, UserRoles.ADMIN, UserRoles.SUPER_ADMIN])] 
    }, Controller.createBlock)

    
    app.get('/blocks', { 
        preHandler: [authMiddleware, authorizeMiddleware([UserRoles.BARBER, UserRoles.ADMIN, UserRoles.SUPER_ADMIN])] 
    }, Controller.listBlocks)

    app.patch('/blocks/:blockId/:isActive', { 
        preHandler: [authMiddleware, authorizeMiddleware([UserRoles.BARBER, UserRoles.ADMIN, UserRoles.SUPER_ADMIN])] 
    }, Controller.desativeBlock)
}