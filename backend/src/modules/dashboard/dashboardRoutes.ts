import * as Controller from './dashboardController';
import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/auth';
import { authorizeMiddleware, UserRoles } from '../../middlewares/authorize';

export async function dashboardRoutes(app: FastifyInstance) {
    app.get('/barbershop/:barbershopId/dashboard', {
        preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.BARBER])]
    }, Controller.getDashboard);
}