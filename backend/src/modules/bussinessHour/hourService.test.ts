import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma } = vi.hoisted(() => ({
    prisma: {
        barbershop: {
            findUnique: vi.fn(),
        },
        businessHour: {
            findMany: vi.fn(),
            upsert: vi.fn(),
        },
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));

import { businessHourList, businessHourUpsert, getBarbershopLocalDateTime } from "./hourService";

describe("hourService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("lists hours for a barbershop", async () => {
        prisma.barbershop.findUnique.mockResolvedValue({ id: "shop-1" });
        prisma.businessHour.findMany.mockResolvedValue([{ dayOfWeek: "MONDAY", isOpen: true }]);

        const result = await businessHourList("shop-1");

        expect(result).toEqual([{ dayOfWeek: "MONDAY", isOpen: true }]);
        expect(prisma.businessHour.findMany).toHaveBeenCalledWith({
            where: { barbershopId: "shop-1" },
            orderBy: { dayOfWeek: "asc" },
        });
    });

    it("upserts a business hour entry keyed by shop and weekday", async () => {
        prisma.barbershop.findUnique.mockResolvedValue({ id: "shop-1" });
        const created = { id: "hour-1", barbershopId: "shop-1", dayOfWeek: "MONDAY", isOpen: true };
        prisma.businessHour.upsert.mockResolvedValue(created);

        const result = await businessHourUpsert("shop-1", {
            dayOfWeek: "MONDAY",
            isOpen: true,
            openTime: "09:00",
            closeTime: "18:00",
        });

        expect(result).toBe(created);
        expect(prisma.businessHour.upsert).toHaveBeenCalledWith({
            where: {
                barbershopId_dayOfWeek: {
                    barbershopId: "shop-1",
                    dayOfWeek: "MONDAY",
                },
            },
            update: {
                isOpen: true,
                openTime: "09:00",
                closeTime: "18:00",
            },
            create: {
                barbershopId: "shop-1",
                dayOfWeek: "MONDAY",
                isOpen: true,
                openTime: "09:00",
                closeTime: "18:00",
            },
        });
    });

    it("formats local date and time for the barbershop timezone", async () => {
        const result = await getBarbershopLocalDateTime(new Date("2025-01-15T10:30:00Z"), "UTC");

        expect(result.dayOfWeek).toBe("QUARTA-FEIRA");
        expect(result.timeString).toBe("10:30");
    });
});
