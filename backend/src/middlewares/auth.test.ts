import { beforeEach, describe, expect, it, vi } from "vitest";

const { jwt, prisma, env } = vi.hoisted(() => ({
    jwt: {
        verify: vi.fn(),
        sign: vi.fn(),
    },
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
    env: {
        JWT_SECRET: "secret",
        JWT_REFRESH_SECRET: "refresh-secret",
        JWT_EXPIRES_IN: "1h",
        JWT_REFRESH_EXPIRES_IN: "7d",
        COOKIES_SECRET: "cookies", 
    },
}));

vi.mock("jsonwebtoken", () => ({ default: jwt }));
vi.mock("../database/prisma", () => ({ default: prisma }));
vi.mock("../env", () => ({ env }));

import { authMiddleware } from "./auth";

describe("authMiddleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 when auth header is missing", async () => {
        const req = { headers: {} } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        await authMiddleware(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ error: "token não foi fornecido" });
    });

    it("returns 401 when token is invalid", async () => {
        const req = { headers: { authorization: "Bearer invalid-token" } } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        jwt.verify.mockImplementation(() => {
            throw new Error("invalid token");
        });

        await authMiddleware(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ error: "token inválido" });
    });

    it("returns 401 when decoded payload is malformed", async () => {
        const req = { headers: { authorization: "Bearer valid-token" } } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        jwt.verify.mockReturnValue({ email: "test@email.com" });

        await authMiddleware(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ error: "Payload do token inválido" });
    });

    it("returns 403 when the user is inactive or not found", async () => {
        const req = { headers: { authorization: "Bearer valid-token" } } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        jwt.verify.mockReturnValue({ id: "user-1", email: "test@email.com" });
        prisma.user.findUnique.mockResolvedValue({ status: "INACTIVE", role: "CLIENTE" });

        await authMiddleware(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ error: "Usuário não ativado" });
    });

    it("authenticates an active user and attaches req.user", async () => {
        const req = { headers: { authorization: "Bearer valid-token" } } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        jwt.verify.mockReturnValue({ id: "user-1", email: "test@email.com" });
        prisma.user.findUnique.mockResolvedValue({ status: "ACTIVE", role: "ADMIN" });

        await authMiddleware(req, res);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: "user-1" },
            select: { status: true, role: true },
        });
        expect(req.user).toEqual({
            id: "user-1",
            email: "test@email.com",
            role: "ADMIN",
        });
        expect(res.status).not.toHaveBeenCalled();
    });
});
