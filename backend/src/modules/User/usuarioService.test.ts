import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, bcrypt, token, jwt } = vi.hoisted(() => ({
    prisma: {
        user: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        },
        refreshToken: {
            create: vi.fn(),
        },
    },
    bcrypt: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
    token: {
        generatedToken: vi.fn(),
        generatedRefreshToken: vi.fn(),
        verifiRefreshToken: vi.fn(),
    },
    jwt: {
        decode: vi.fn(),
    },
}));

vi.mock("../../database/prisma", () => ({ default: prisma }));
vi.mock("bcryptjs", () => ({ default: bcrypt }));
vi.mock("../../utils/token", () => ({
    generatedToken: token.generatedToken,
    generatedRefreshToken: token.generatedRefreshToken,
    verifiRefreshToken: token.verifiRefreshToken,
}));
vi.mock("jsonwebtoken", () => ({ default: { decode: jwt.decode } }));

import { createUser, listUser, loginUser } from "./usuarioService";

describe("usuarioService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a user and hashes the password", async () => {
        prisma.user.findFirst.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashed-password");
        prisma.user.create.mockResolvedValue({
            id: "user-1",
            name: "Maria",
            email: "maria@email.com",
            passwordHash: "hashed-password",
            phone: "11999999999",
        });

        const result = await createUser({
            name: "Maria",
            email: "maria@email.com",
            password: "secret123",
            phone: "11999999999",
        });

        expect(result).toEqual({
            id: "user-1",
            name: "Maria",
            email: "maria@email.com",
            passwordHash: "hashed-password",
            phone: "11999999999",
        });
        expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 12);
    });

    it("logs in a user and creates a refresh token record", async () => {
        prisma.user.findFirst.mockResolvedValue({
            id: "user-1",
            name: "Maria",
            email: "maria@email.com",
            passwordHash: "hashed-password",
            phone: "11999999999",
            status: "ACTIVE",
            role: "CLIENT",
        });
        bcrypt.compare.mockResolvedValue(true);
        token.generatedToken.mockResolvedValue("access-token");
        token.generatedRefreshToken.mockResolvedValue("refresh-token");
        jwt.decode.mockReturnValue({ exp: 1760000000 });

        const result = await loginUser({ email: "maria@email.com", password: "secret123" });

        expect(result).toMatchObject({
            id: "user-1",
            email: "maria@email.com",
            tokenGenerated: "access-token",
            RefreshTokenGenerated: "refresh-token",
        });
        expect(prisma.refreshToken.create).toHaveBeenCalledWith({
            data: {
                tokenHash: "refresh-token",
                userId: "user-1",
                expiresAt: new Date(1760000000 * 1000),
            },
        });
    });

    it("lists users with pagination and selection", async () => {
        prisma.user.findMany.mockResolvedValue([{ id: "user-1", name: "Maria", email: "maria@email.com" }]);

        const result = await listUser({ page: 2, limit: 5 });

        expect(result).toEqual([{ id: "user-1", name: "Maria", email: "maria@email.com" }]);
        expect(prisma.user.findMany).toHaveBeenCalledWith({
            select: {
                id: true,
                name: true,
                email: true,
                age: true,
            },
            skip: 5,
            take: 5,
            orderBy: { name: "asc" },
        });
    });
});
