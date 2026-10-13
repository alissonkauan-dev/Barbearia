import * as Controller from './hourController';
import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middlewares/auth';
import { authorizeMiddleware, UserRoles } from '../../middlewares/authorize';

export async function businessHourRoutes(app: FastifyInstance) {
    // Listar horários é público ou protegido por auth dependendo da regra (aqui deixamos protegido por auth)
    app.get('/barbershop/:barbershopId/hours', { preHandler: [authMiddleware] }, Controller.listBusinessHours);
    
    // Configurar/Atualizar horários restrito a Admins / Super Admins
    app.put('/barbershop/:barbershopId/hours', { 
        preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])] 
    }, Controller.upsertBusinessHour);
}