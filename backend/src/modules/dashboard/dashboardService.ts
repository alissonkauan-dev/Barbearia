import prisma from "../../database/prisma";
import * as Schema from "./dashboardSchema";

export async function getDashboardMetrics(barbershopId: string, query: Schema.DashboardQueryType) {
    const { startDate, endDate, barberId } = query;

    const dateFilter: any = {};
    if (startDate || endDate) {
        dateFilter.startAt = {};
        if (startDate) dateFilter.startAt.gte = startDate;
        if (endDate) dateFilter.startAt.lte = endDate;
    }

    const baseWhere = {
        barbershopId,
        ...(barberId && { barberId }),
        ...dateFilter
    };

    try {
        const [totalAppointments, completedAppointments, cancelledAppointments, revenueData, popularServices] = await Promise.all([
            prisma.appointment.count({ where: baseWhere }),
            prisma.appointment.count({ where: { ...baseWhere, status: "COMPLETED" } }),
            prisma.appointment.count({ where: { ...baseWhere, status: "CANCELLED" } }),
            prisma.appointment.aggregate({
                where: { ...baseWhere, status: "COMPLETED" },
                _sum: { servicePrice: true }
            }),
            prisma.appointment.groupBy({
                by: ['serviceName'],
                where: { ...baseWhere, status: "COMPLETED" },
                _count: { serviceName: true },
                orderBy: { _count: { serviceName: 'desc' } },
                take: 5
            })
        ]);

        return {
            summary: {
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                totalRevenue: revenueData._sum.servicePrice || 0
            },
            popularServices: popularServices.map(service => ({
                serviceName: service.serviceName,
                totalCompleted: service._count.serviceName
            }))
        };
    } catch (error) {
        console.error("Erro ao calcular métricas do dashboard. ERROR: ", error);
        throw new Error("Não foi possível carregar as métricas do dashboard");
    }
}