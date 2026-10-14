import * as Controller from './appointmentController'
import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../../middlewares/auth'
import {authorizeMiddleware, UserRoles} from '../../middlewares/authorize'


export async function appointmentRoutes(app: FastifyInstance){


app.post('/appointment/create', {preHandler: [authMiddleware]}, Controller.createAppointment)
app.get('/appointment/list', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])]}, Controller.listAppointment)
app.patch('/appointment/update/:appointId', {preHandler: [authMiddleware]}, Controller.updateAppointment)
app.patch('/appointment/aprove/:appointId', {preHandler: [authMiddleware, authorizeMiddleware([UserRoles.ADMIN, UserRoles.BARBER, UserRoles.SUPER_ADMIN])]}, Controller.aproveAppointment )
app.patch('/appointment/cancel/:appointId', {preHandler: authMiddleware}, Controller.cancelAppointment)

}