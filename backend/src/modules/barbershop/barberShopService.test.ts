import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
    prisma: {
        barbershop: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));

import { barberShopCreate, barberShopList, barberShopUpdate } from "./barberShopService";

describe("barberShopService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a barbershop when the name is unique", async () => {
        prisma.barbershop.findFirst.mockResolvedValue(null);
        const created = { id: "shop-1", name: "Barbearia Central" };
        prisma.barbershop.create.mockResolvedValue(created);

        const result = await barberShopCreate({
            name: "Barbearia Central",
            slug: "barbearia-central",
            document: "12345678000199",
            phone: "11999887766",
            email: "contato@barbearia.com",
            street: "Avenida Paulista",
            number: "1000",
            state: "SP",
            zipCode: "01310-100",
            timeZone: "America/Sao_Paulo",
        });

        expect(result).toBe(created);
        expect(prisma.barbershop.create).toHaveBeenCalledWith({
            data: {
                name: "Barbearia Central",
                slug: "barbearia-central",
                phone: "11999887766",
                document: "12345678000199",
                email: "contato@barbearia.com",
                street: "Avenida Paulista",
                number: "1000",
                state: "SP",
                zipCode: "01310-100",
                timezone: "America/Sao_Paulo",
            },
        });
    });

    it("rejects duplicate barbershop names", async () => {
        prisma.barbershop.findFirst.mockResolvedValue({ id: "shop-1" });

        await expect(barberShopCreate({
            name: "Barbearia Central",
            slug: "barbearia-central",
            document: "12345678000199",
            phone: "11999887766",
            email: "contato@barbearia.com",
            street: "Avenida Paulista",
            number: "1000",
            state: "SP",
            zipCode: "01310-100",
            timeZone: "America/Sao_Paulo",
        })).rejects.toThrow("Barbearia já existe");

        expect(prisma.barbershop.create).not.toHaveBeenCalled();
    });

    it("updates only provided barbershop fields", async () => {
        prisma.barbershop.findUnique.mockResolvedValue({ id: "shop-1" });
        const updated = { id: "shop-1", name: "Barbearia Atualizada", slug: "barbearia-atualizada" };
        prisma.barbershop.update.mockResolvedValue(updated);

        const result = await barberShopUpdate("shop-1", {
            name: "Barbearia Atualizada",
            slug: "barbearia-atualizada",
            timeZone: "UTC",
        });

        expect(result).toBe(updated);
        expect(prisma.barbershop.update).toHaveBeenCalledWith({
            where: { id: "shop-1" },
            data: {
                name: "Barbearia Atualizada",
                slug: "barbearia-atualizada",
                timeZone: "UTC",
            },
        });
    });

    it("lists active barbershops with pagination", async () => {
        prisma.barbershop.findMany.mockResolvedValue([]);

        await barberShopList({ page: 2, limit: 5, isActived: true });

        expect(prisma.barbershop.findMany).toHaveBeenCalledWith({
            where: { isActive: true },
            take: 5,
            skip: 5,
            orderBy: { name: "asc" },
        });
    });
});
