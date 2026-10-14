import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMiddleware } = vi.hoisted(() => ({
    authMiddleware: vi.fn(),
}));

vi.mock("./auth", () => ({ authMiddleware }));

import authorizeMiddleware, { UserRoles } from "./authorize";

describe("authorizeMiddleware", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 when no user is authenticated", async () => {
        authMiddleware.mockImplementation(async (_req: any, res: any) => {
            res.sent = false;
        });

        const req = {} as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
            sent: false,
        } as any;

        await authorizeMiddleware([UserRoles.ADMIN])(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ error: "Usuário não autenticado" });
    });

    it("returns 403 when the user role is not allowed", async () => {
        authMiddleware.mockImplementation(async (req: any, _res: any) => {
            req.user = { id: "user-1", email: "user@email.com", role: UserRoles.CLIENTE };
        });

        const req = {} as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
            sent: false,
        } as any;

        await authorizeMiddleware([UserRoles.ADMIN])(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({ error: "Você não tem permissão para acessar este recurso" });
    });

    it("allows the request when the role is permitted", async () => {
        authMiddleware.mockImplementation(async (req: any, _res: any) => {
            req.user = { id: "user-1", email: "user@email.com", role: UserRoles.ADMIN };
        });

        const req = {} as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
            sent: false,
        } as any;

        await expect(authorizeMiddleware([UserRoles.ADMIN])(req, res)).resolves.toBeUndefined();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });

    it("returns immediately when auth middleware already sent a response", async () => {
        authMiddleware.mockImplementation(async (_req: any, res: any) => {
            res.sent = true;
        });

        const req = {} as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
            sent: false,
        } as any;

        await expect(authorizeMiddleware([UserRoles.ADMIN])(req, res)).resolves.toBeUndefined();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });
});
