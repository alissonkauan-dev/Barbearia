import { beforeEach, describe, expect, it, vi } from "vitest";

const { userServiceModule, userRoles } = vi.hoisted(() => ({
    userServiceModule: {
        createUser: vi.fn(),
        loginUser: vi.fn(),
        listUser: vi.fn(),
        deleteMyUser: vi.fn(),
        updateUser: vi.fn(),
        findMyAppointments: vi.fn(),
        refreshToken: vi.fn(),
    },
    userRoles: { ADMIN: "ADMIN" },
}));

vi.mock("./usuarioService", () => ({
    ...userServiceModule,
}));

vi.mock("../../middlewares/authorize", () => ({
    UserRoles: userRoles,
}));

import {
    deleteUser,
    findAppointments,
    handlerCookiesToken,
    listUsers,
    updateUser,
    userCreate,
    userLogin,
} from "./usuarioController";

describe("usuarioController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a user and responds 201", async () => {
        const req = { body: { name: "Maria", email: "maria@email.com", password: "123456" } } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        userServiceModule.createUser.mockResolvedValue({ name: "Maria" });

        await userCreate(req, res);

        expect(userServiceModule.createUser).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
            status: " Usuario criado com sucesso: ",
            data: "Maria",
        });
    });

    it("logs in a user and sets the refresh cookie", async () => {
        const req = { body: { email: "maria@email.com", password: "123456" } } as any;
        const res = {
            setCookie: vi.fn(),
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        userServiceModule.loginUser.mockResolvedValue({
            id: "user-1",
            name: "Maria",
            email: "maria@email.com",
            role: "CLIENT",
            tokenGenerated: "access-token",
            RefreshTokenGenerated: "refresh-token",
        });

        await userLogin(req, res);

        expect(res.setCookie).toHaveBeenCalledWith("refreshToken", "refresh-token", {
            path: "/",
            httpOnly: false,
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60,
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
            status: "Usuario Logado: ",
            data: {
                user: {
                    id: "user-1",
                    name: "Maria",
                    email: "maria@email.com",
                    role: "CLIENT",
                },
                accessToken: "access-token",
            },
        });
    });

    it("lists users with 201 response", async () => {
        const req = {} as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
        userServiceModule.listUser.mockResolvedValue([{ id: "user-1" }]);

        await listUsers(req, res);

        expect(userServiceModule.listUser).toHaveBeenCalledWith();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
            status: "Usuarios Listados com Sucesso",
            data: [{ id: "user-1" }],
        });
    });

    it("blocks deleting another user when user lacks admin permission", async () => {
        const req = {
            query: { userId: "user-2" },
            user: { id: "user-1", role: "CLIENT" },
        } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        await deleteUser(req, res);

        expect(userServiceModule.deleteMyUser).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith({
            status: "Usuario não tem permissão para deletar outro usuario",
        });
    });

    it("updates another user when requester is admin", async () => {
        const req = {
            query: { userId: "user-2" },
            user: { id: "user-1", role: "ADMIN" },
            body: { name: "Maria Atualizada" },
        } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        userServiceModule.updateUser.mockResolvedValue({ id: "user-2", name: "Maria Atualizada" });

        await updateUser(req, res);

        expect(userServiceModule.updateUser).toHaveBeenCalledWith("user-2", req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            status: "Usuario atualizado com sucesso",
            data: { id: "user-2", name: "Maria Atualizada" },
        });
    });

    it("returns 401 when refresh token is missing", async () => {
        const req = { cookies: {} } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        await handlerCookiesToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            status: "Error",
            message: "Refresh token nao encontrado",
        });
    });
});
