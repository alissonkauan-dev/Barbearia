import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
    prisma: {
        barber: {
            findUnique: vi.fn(),
        },
        barberBlock: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));

import { blockCreate, blockDesative, blockList } from "./blockService";

describe("blockService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a block for a barber when the schedule is valid", async () => {
        prisma.barber.findUnique.mockResolvedValue({ id: "barber-1" });
        const created = { id: "block-1", barberId: "barber-1", title: "Almoço" };
        prisma.barberBlock.create.mockResolvedValue(created);

        const futureStart = new Date(Date.now() + 60 * 60 * 1000);
        const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000);

        const result = await blockCreate("barber-1", {
            title: "Almoço",
            type: "LUNCH",
            reason: "Intervalo",
            startAt: futureStart,
            endAt: futureEnd,
        });

        expect(result).toBe(created);
        expect(prisma.barberBlock.create).toHaveBeenCalledWith({
            data: {
                barberId: "barber-1",
                type: "LUNCH",
                reason: "Intervalo",
                title: "Almoço",
                startAt: futureStart,
                endAt: futureEnd,
            },
        });
    });

    it("rejects blocks with invalid time ranges", async () => {
        prisma.barber.findUnique.mockResolvedValue({ id: "barber-1" });

        const future = new Date(Date.now() + 60 * 60 * 1000);

        await expect(blockCreate("barber-1", {
            title: "Almoço",
            type: "LUNCH",
            reason: "Intervalo",
            startAt: future,
            endAt: future,
        })).rejects.toThrow("data de inicio maior ou igual a data de termino da restrição");
    });

    it("lists barber blocks with pagination", async () => {
        prisma.barber.findUnique.mockResolvedValue({ id: "barber-1" });
        prisma.barberBlock.findMany.mockResolvedValue([]);

        await blockList("barber-1", { page: 2, limit: 5 });

        expect(prisma.barberBlock.findMany).toHaveBeenCalledWith({
            where: { barberId: "barber-1" },
            take: 5,
            skip: 5,
            orderBy: { createdAt: "asc" },
        });
    });

    it("deactivates a block by id", async () => {
        prisma.barberBlock.findUnique.mockResolvedValue({ id: "block-1" });
        prisma.barberBlock.update.mockResolvedValue({ id: "block-1", isActive: false });

        const result = await blockDesative({ blockId: "block-1", isActive: false });

        expect(result).toEqual({ id: "block-1", isActive: false });
        expect(prisma.barberBlock.update).toHaveBeenCalledWith({
            where: { id: "block-1" },
            data: { isActive: false },
        });
    });
});
