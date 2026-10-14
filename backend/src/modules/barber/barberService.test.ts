import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, bcrypt } = vi.hoisted(() => ({
    prisma: {
        user: {
            findFirst: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        barbershop: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        barber: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        },
        $transaction: vi.fn(),
    },
    bcrypt: {
        hash: vi.fn(),
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));
vi.mock("bcryptjs", () => ({ default: bcrypt }));

import { barberCreate, barberDelete, barberList } from "./barberService";

describe("barberService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a barber for an existing shop and hashes the password", async () => {
        prisma.user.findFirst.mockResolvedValue(null);
        prisma.barbershop.findFirst.mockResolvedValue({ id: "shop-1" });
        bcrypt.hash.mockResolvedValue("hashed-password");

        prisma.$transaction.mockImplementation(async (cb) => {
            const tx = {
                user: {
                    create: vi.fn().mockResolvedValue({
                        id: "user-1",
                        name: "João",
                        email: "joao@email.com",
                        passwordHash: "hashed-password",
                        phone: "11999999999",
                        role: "BARBER",
                        barbershopId: "shop-1",
                    }),
                },
                barber: {
                    create: vi.fn().mockResolvedValue({
                        id: "barber-1",
                        userId: "user-1",
                        barbershopId: "shop-1",
                        bio: "Especialista em cortes clássicos",
                        photoUrl: "https://img.com/barber.jpg",
                    }),
                },
            };

            return cb(tx);
        });

        const result = await barberCreate({
            name: "João",
            email: "joao@email.com",
            password: "secret123",
            phone: "11999999999",
            barbershopSlug: "academia-corte",
            bio: "Especialista em cortes clássicos",
            photoUrl: "https://img.com/barber.jpg",
        });

        expect(result).toEqual({
            id: "barber-1",
            userId: "user-1",
            barbershopId: "shop-1",
            bio: "Especialista em cortes clássicos",
            photoUrl: "https://img.com/barber.jpg",
            newUser: {
                id: "user-1",
                name: "João",
                email: "joao@email.com",
                passwordHash: "hashed-password",
                phone: "11999999999",
                role: "BARBER",
                barbershopId: "shop-1",
            },
        });
        expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 12);
        expect(prisma.barbershop.findFirst).toHaveBeenCalledWith({ where: { slug: "academia-corte" } });
    });

    it("lists only active barbers from a barbershop with page and limit", async () => {
        const list = [{ id: "barber-1", user: { name: "João" } }];
        prisma.barber.findMany.mockResolvedValue(list);

        const result = await barberList({ page: 2, limit: 5, isActived: true }, "shop-1");

        expect(result).toBe(list);
        expect(prisma.barber.findMany).toHaveBeenCalledWith({
            where: {
                AND: [
                    { isActive: true },
                    { barbershopId: "shop-1" },
                ],
            },
            take: 5,
            skip: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                bio: true,
                photoUrl: true,
                isActive: true,
                createdAt: true,
                barbershopId: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        role: true,
                    },
                },
            },
        });
    });

    it("deactivates a barber and returns a success message", async () => {
        prisma.barber.findUnique.mockResolvedValue({ id: "barber-1", userId: "user-1" });
        prisma.$transaction.mockImplementation(async (cb) => {
            const tx = {
                user: {
                    update: vi.fn().mockResolvedValue({}),
                },
                barber: {
                    update: vi.fn().mockResolvedValue({
                        id: "barber-1",
                        userId: "user-1",
                        user: { name: "João" },
                    }),
                },
            };
            return cb(tx);
        });

        const result = await barberDelete("barber-1");

        expect(result).toEqual({ message: "Barbeiro: João foi desativado com sucesso" });
    });
});
