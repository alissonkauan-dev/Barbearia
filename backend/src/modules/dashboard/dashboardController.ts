import * as Service from './dashboardService';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as Schema from './dashboardSchema';

export async function getDashboard(req: FastifyRequest, res: FastifyReply) {
    const { barbershopId } = req.params as { barbershopId: string };
    const query = Schema.dashboardQuerySchema.parse(req.query);

    const metrics = await Service.getDashboardMetrics(barbershopId, query);
    return res.status(200).send({ status: "Métricas obtidas com sucesso", data: metrics });
}