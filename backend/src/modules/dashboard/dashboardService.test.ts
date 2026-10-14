import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
    prisma: {
        appointment: {
            count: vi.fn(),
            aggregate: vi.fn(),
            groupBy: vi.fn(),
        },
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));

import { getDashboardMetrics } from "./dashboardService";

describe("dashboardService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("aggregates appointment counts, revenue and popular services", async () => {
        prisma.appointment.count
            .mockResolvedValueOnce(12)
            .mockResolvedValueOnce(9)
            .mockResolvedValueOnce(3);
        prisma.appointment.aggregate.mockResolvedValue({ _sum: { servicePrice: 540 } });
        prisma.appointment.groupBy.mockResolvedValue([
            { serviceName: "Corte e barba", _count: { serviceName: 4 } },
            { serviceName: "Barba", _count: { serviceName: 2 } },
        ]);

        const result = await getDashboardMetrics("shop-1", {
            startDate: new Date("2025-01-01T00:00:00Z"),
            endDate: new Date("2025-01-31T00:00:00Z"),
            barberId: "barber-1",
        });

        expect(result).toEqual({
            summary: {
                totalAppointments: 12,
                completedAppointments: 9,
                cancelledAppointments: 3,
                totalRevenue: 540,
            },
            popularServices: [
                { serviceName: "Corte e barba", totalCompleted: 4 },
                { serviceName: "Barba", totalCompleted: 2 },
            ],
        });
        expect(prisma.appointment.aggregate).toHaveBeenCalledWith({
            where: { barbershopId: "shop-1", barberId: "barber-1", startAt: { gte: new Date("2025-01-01T00:00:00Z"), lte: new Date("2025-01-31T00:00:00Z") }, status: "COMPLETED" },
            _sum: { servicePrice: true },
        });
    });
});
