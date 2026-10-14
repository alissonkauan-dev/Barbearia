import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
    prisma: {
        barbershop: {
            findUnique: vi.fn(),
        },
        businessHour: {
            findUnique: vi.fn(),
        },
        $transaction: vi.fn(),
        user: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
        },
        barber: {
            findFirst: vi.fn(),
        },
        barberBlock: {
            findFirst: vi.fn(),
        },
        service: {
            findFirst: vi.fn(),
        },
        appointment: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));

import { appointmentCancel, appointmentCreate } from "./appointmentService";

describe("appointmentService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates an appointment when barber, service, business hour and availability are valid", async () => {
        const startTime = new Date("2035-01-01T10:00:00Z");
        const endTime = new Date("2035-01-01T10:30:00Z");
        const futureDay = new Intl.DateTimeFormat("pt-BR", {
            timeZone: "UTC",
            weekday: "long",
        }).formatToParts(startTime).find((part) => part.type === "weekday")?.value.toUpperCase() ?? "SEGUNDA-FEIRA";

        prisma.barbershop.findUnique.mockResolvedValue({ id: "shop-1", timezone: "UTC" });
        prisma.businessHour.findUnique.mockResolvedValue({
            barbershopId: "shop-1",
            dayOfWeek: futureDay,
            isOpen: true,
            openTime: "09:00",
            closeTime: "18:00",
        });
        prisma.$transaction.mockImplementation(async (cb) => {
            const tx = {
                user: {
                    findFirst: vi.fn().mockResolvedValue({ id: "barber-user-1" }),
                },
                barber: {
                    findFirst: vi.fn().mockResolvedValue({ id: "barber-1" }),
                },
            };
            return cb(tx);
        });
        prisma.barberBlock.findFirst.mockResolvedValue(null);
        prisma.service.findFirst.mockResolvedValue({
            id: "service-1",
            name: "Corte",
            price: 80,
            durationMin: 30,
            barbershopId: "shop-1",
        });
        prisma.user.findUnique.mockResolvedValue({ id: "client-1" });
        prisma.appointment.findFirst.mockResolvedValue(null);
        prisma.appointment.create.mockResolvedValue({
            id: "appointment-1",
            barbershopId: "shop-1",
            barberId: "barber-1",
            serviceId: "service-1",
            clientId: "client-1",
            startAt: startTime,
            endAt: endTime,
            status: "SCHEDULED",
        });

        const result = await appointmentCreate("client-1", "shop-1", {
            barberName: "João",
            serviceName: "Corte",
            startTime,
            endTime,
            notes: "Quero um corte clássico",
        });

        expect(result).toMatchObject({
            id: "appointment-1",
            barbershopId: "shop-1",
            clientId: "client-1",
        });
        expect(prisma.appointment.create).toHaveBeenCalledWith({
            data: {
                barbershopId: "shop-1",
                barberId: "barber-1",
                serviceId: "service-1",
                clientId: "client-1",
                startAt: startTime,
                endAt: endTime,
                clientNotes: "Quero um corte clássico",
                serviceName: "Corte",
                servicePrice: 80,
                durationMin: 30,
            },
        });
    });

    it("cancels an appointment when the status is explicitly cancelled", async () => {
        prisma.appointment.findFirst.mockResolvedValue({ id: "appointment-1" });
        prisma.appointment.update.mockResolvedValue({
            id: "appointment-1",
            status: "CANCELLED",
            cancelReason: "CLIENT_REQUEST",
        });

        const result = await appointmentCancel("appointment-1", {
            status: "CANCELLED",
            CancellationReason: "CLIENT_REQUEST",
        });

        expect(result).toEqual({
            id: "appointment-1",
            status: "CANCELLED",
            cancelReason: "CLIENT_REQUEST",
        });
        expect(prisma.appointment.update).toHaveBeenCalledWith({
            where: { id: "appointment-1" },
            data: {
                status: "CANCELLED",
                cancelReason: "CLIENT_REQUEST",
            },
        });
    });
});
