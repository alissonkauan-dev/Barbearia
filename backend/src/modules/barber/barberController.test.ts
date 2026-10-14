import { beforeEach, describe, expect, it, vi } from "vitest";

const { barberServiceModule } = vi.hoisted(() => ({
    barberServiceModule: {
        barberCreate: vi.fn(),
        barberUpdate: vi.fn(),
        barberList: vi.fn(),
        barberDelete: vi.fn(),
    },
}));

vi.mock("./barberService", () => ({
    ...barberServiceModule,
}));

vi.mock("./barberSchema", () => ({
    barberListQuerySchema: {
        parse: (query: any) => query,
    },
}));

import {
    createBarber,
    deleteBarber,
    listBarber,
    updateBarber,
} from "./barberController";

describe("barberController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a barber and returns 201", async () => {
        const req = { body: { name: "João", email: "joao@email.com" } } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        barberServiceModule.barberCreate.mockResolvedValue({ id: "barber-1" });

        await createBarber(req, res);

        expect(barberServiceModule.barberCreate).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
            status: "Barbeiro criado com sucesso",
            data: { id: "barber-1" },
        });
    });

    it("denies update for non-admin barber when targeting another barber", async () => {
        const req = {
            query: { barberId: "barber-2" },
            user: { barberId: "barber-1", role: "BARBER" },
            body: { bio: "Nova bio" },
        } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        await updateBarber(req, res);

        expect(barberServiceModule.barberUpdate).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Usuario não tem permissão para atualizar outro barbeiro");
    });

    it("updates a barber when the user is allowed", async () => {
        const req = {
            query: { barberId: "barber-1" },
            user: { barberId: "barber-1", role: "BARBER" },
            body: { bio: "Bio nova" },
        } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        barberServiceModule.barberUpdate.mockResolvedValue({ id: "barber-1", bio: "Bio nova" });

        await updateBarber(req, res);

        expect(barberServiceModule.barberUpdate).toHaveBeenCalledWith("barber-1", req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            status: "Cadastro atualizado",
            data: { id: "barber-1", bio: "Bio nova" },
        });
    });

    it("lists barbers only for the same barbershop when user is not admin", async () => {
        const req = {
            params: { id: "shop-1" },
            query: { page: 1, limit: 10 },
            user: { role: "BARBER", barbershopId: "shop-2" },
        } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        await listBarber(req, res);

        expect(barberServiceModule.barberList).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith("Usuário não tem permissão para acessar as informações de outra barbearia");
    });

    it("deletes a barber when request is authorized", async () => {
        const req = {
            query: { barberId: "barber-1" },
            user: { barberId: "barber-1", role: "BARBER" },
        } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        barberServiceModule.barberDelete.mockResolvedValue({ message: "Barbeiro desativado" });

        await deleteBarber(req, res);

        expect(barberServiceModule.barberDelete).toHaveBeenCalledWith("barber-1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            status: "Barbeiro deletado com sucesso",
            data: { message: "Barbeiro desativado" },
        });
    });
});
