import * as Service from './appointmentService'
import type { FastifyRequest, FastifyReply } from 'fastify'
import * as Schema from './appointmenSchema';


export async function createAppointment(req: FastifyRequest, res: FastifyReply){

    const {barbershopId, userId} = req.params as {barbershopId: string, userId: string}
    const data = Schema.appointmentCreateSchema.parse(req.body)
    const appointmentCreating = await Service.appointmentCreate(userId,barbershopId,data)
    return res.status(201).send({status: 'agendamento criado com sucesso', data: appointmentCreating})

}

export async function cancelAppointment(req: FastifyRequest, res: FastifyReply){

    const {appointmentId} = req.params as {appointmentId: string}
    const dataCancel = Schema.appointmentUpdateSchema.parse(req.body)
    const appointmentCancelling = await Service.appointmentCancel(appointmentId,dataCancel)
    return res.status(200).send({status: "agendamento cancelado com sucesso ", data: appointmentCancelling})

}

export async function listAppointment(req: FastifyRequest, res: FastifyReply){

   const {barbershopId} = req.params as {barbershopId: string}
   const listParamns = req.query as {page?: number, limit?: number, barberShopId?: string, date?: Date;}
   const appointmentListting = await Service.appointmentList(listParamns, barbershopId)
   return res.status(200).send({status: "Todos os agendamentos foram listados", data: appointmentListting})

}

export async function updateAppointment(req: FastifyRequest, res: FastifyReply){

     const {appointmentId} = req.params as {appointmentId: string}
     const dataUpdate = Schema.appointmentUpdateSchema.parse(req.body)
     const appointmentUpdatting = await Service.appointmentUpdate(appointmentId,dataUpdate) 
    return res.status(200).send({status: "Agendamento atualizado com sucesso, esperando aprovação", data: appointmentUpdatting})
}

export async function aproveAppointment(req: FastifyRequest, res: FastifyReply){

     const {appointmentId} = req.params as {appointmentId: string}
    const dataAprove = Schema.appointmentAproveSchema.parse(req.body)
    const appointmentAprovving = await Service.appointmentAprove(appointmentId, dataAprove)
    return res.status(200).send({status: "alterações do agendamento validadas com sucesso ", data: appointmentAprovving})
}