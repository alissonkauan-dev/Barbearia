import * as Service from './hourService';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as Schema from './hourSchema'; // Ou o nome do teu schema do Zod para hours

export async function listBusinessHours(req: FastifyRequest, res: FastifyReply) {
    const { barbershopId } = req.params as { barbershopId: string };
    const hours = await Service.businessHourList(barbershopId);
    return res.status(200).send({ status: "Horários de funcionamento listados com sucesso", data: hours });
}

export async function upsertBusinessHour(req: FastifyRequest, res: FastifyReply) {
    const { barbershopId } = req.params as { barbershopId: string };
    const body = Schema.businessHourUpsertSchema.parse(req.body); // Validado pelo schema no service ou aqui
    const updatedHour = await Service.businessHourUpsert(barbershopId, body);
    return res.status(200).send({ status: "Horário de funcionamento atualizado com sucesso", data: updatedHour });
}