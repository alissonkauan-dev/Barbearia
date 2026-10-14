import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
    prisma: {
        service: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));

import { createService, listServices } from "./servicesService";

describe("servicesService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a service with the schema defaults and duration mapping", async () => {
        const created = { id: "service-1", name: "Corte clássico", durationMin: 30 };
        prisma.service.findFirst.mockResolvedValue(null);
        prisma.service.create.mockResolvedValue(created);

        const result = await createService({
            name: "Corte clássico",
            price: 35,
            duration: 30,
            barbershopId: "shop-1",
        });

        expect(result).toBe(created);
        expect(prisma.service.create).toHaveBeenCalledWith({
            data: {
                name: "Corte clássico",
                description: "Sem descrição",
                price: 35,
                durationMin: 30,
                barbershopId: "shop-1",
            },
        });
    });

    it("rejects a duplicate service for the same barbershop", async () => {
        prisma.service.findFirst.mockResolvedValue({ id: "existing-service" });

        await expect(createService({
            name: "Corte clássico",
            price: 35,
            duration: 30,
            barbershopId: "shop-1",
        })).rejects.toThrow("Serviço já existe para essa barbearia");
        expect(prisma.service.create).not.toHaveBeenCalled();
    });

    it("lists active services with the requested pagination", async () => {
        prisma.service.findMany.mockResolvedValue([]);

        await listServices({ page: 3, limit: 5 }, "shop-1");

        expect(prisma.service.findMany).toHaveBeenCalledWith({
            where: { AND: [{ barbershopId: "shop-1" }, { isActive: true }] },
            skip: 10,
            take: 5,
            orderBy: { name: "asc" },
        });
    });
});