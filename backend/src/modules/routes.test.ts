import { beforeEach, describe, expect, it, vi } from "vitest";
import fastify from "fastify";

const { servicesController, barberController, userController, authMiddleware, authorizeMiddleware } = vi.hoisted(() => ({
    servicesController: {
        createService: vi.fn(async (_req: any, res: any) => res.status(201).send({ ok: true })),
        updateService: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
        deleteService: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
    },
    barberController: {
        createBarber: vi.fn(async (_req: any, res: any) => res.status(201).send({ ok: true })),
        updateBarber: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
        listBarber: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
        deleteBarber: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
    },
    userController: {
        userCreate: vi.fn(async (_req: any, res: any) => res.status(201).send({ ok: true })),
        userLogin: vi.fn(async (_req: any, res: any) => res.status(201).send({ ok: true })),
        handlerCookiesToken: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
        updateUser: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
        listUsers: vi.fn(async (_req: any, res: any) => res.status(201).send({ ok: true })),
        findAppointments: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
        deleteUser: vi.fn(async (_req: any, res: any) => res.status(200).send({ ok: true })),
    },
    authMiddleware: vi.fn(async () => undefined),
    authorizeMiddleware: vi.fn(() => async () => undefined),
}));

vi.mock("./services/servicesController", () => ({
    createService: servicesController.createService,
    updateService: servicesController.updateService,
    deleteService: servicesController.deleteService,
}));

vi.mock("./barber/barberController", () => ({
    createBarber: barberController.createBarber,
    updateBarber: barberController.updateBarber,
    listBarber: barberController.listBarber,
    deleteBarber: barberController.deleteBarber,
}));

vi.mock("./User/usuarioController", () => ({
    userCreate: userController.userCreate,
    userLogin: userController.userLogin,
    handlerCookiesToken: userController.handlerCookiesToken,
    updateUser: userController.updateUser,
    listUsers: userController.listUsers,
    findAppointments: userController.findAppointments,
    deleteUser: userController.deleteUser,
}));

vi.mock("../middlewares/auth", () => ({
    authMiddleware,
}));

vi.mock("../middlewares/authorize", () => ({
    authorizeMiddleware,
    UserRoles: {
        SUPER_ADMIN: "SUPER_ADMIN",
        ADMIN: "ADMIN",
        CLIENTE: "CLIENTE",
        BARBER: "BARBER",
    },
}));

import { servicesRoutes } from "./services/servicesRoutes";
import { barberRoutes } from "./barber/barberRoutes";
import { userRoutes } from "./User/usuarioRoutes";

describe("route registration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("registers the services routes and delegates to the controller", async () => {
        const app = fastify();
        app.register(servicesRoutes);

        const createResponse = await app.inject({
            method: "POST",
            url: "/services/create",
            payload: { name: "Corte" },
        });

        const updateResponse = await app.inject({
            method: "PATCH",
            url: "/services/service-1/update",
            payload: { name: "Corte premium" },
        });

        const deleteResponse = await app.inject({
            method: "PATCH",
            url: "/services/service-1/inactivate",
        });

        expect(createResponse.statusCode).toBe(201);
        expect(updateResponse.statusCode).toBe(200);
        expect(deleteResponse.statusCode).toBe(200);
        expect(servicesController.createService).toHaveBeenCalledTimes(1);
        expect(servicesController.updateService).toHaveBeenCalledTimes(1);
        expect(servicesController.deleteService).toHaveBeenCalledTimes(1);
    });

    it("registers the barber routes and executes the barber handlers", async () => {
        const app = fastify();
        app.register(barberRoutes);

        const createResponse = await app.inject({
            method: "POST",
            url: "/barber/create",
            payload: { name: "João" },
        });

        const listResponse = await app.inject({
            method: "GET",
            url: "/barber/list",
        });

        const deleteResponse = await app.inject({
            method: "PATCH",
            url: "/barber/delete/barber-1",
        });

        expect(createResponse.statusCode).toBe(201);
        expect(listResponse.statusCode).toBe(200);
        expect(deleteResponse.statusCode).toBe(200);
        expect(barberController.createBarber).toHaveBeenCalledTimes(1);
        expect(barberController.listBarber).toHaveBeenCalledTimes(1);
        expect(barberController.deleteBarber).toHaveBeenCalledTimes(1);
    });

    it("registers the user routes and exposes public and protected endpoints", async () => {
        const app = fastify();
        app.register(userRoutes);

        const createResponse = await app.inject({
            method: "POST",
            url: "/criar",
            payload: { name: "Maria" },
        });

        const loginResponse = await app.inject({
            method: "POST",
            url: "/login",
            payload: { email: "maria@email.com", password: "123456" },
        });

        const refreshResponse = await app.inject({
            method: "POST",
            url: "/refresh",
        });

        expect(createResponse.statusCode).toBe(201);
        expect(loginResponse.statusCode).toBe(201);
        expect(refreshResponse.statusCode).toBe(200);
        expect(userController.userCreate).toHaveBeenCalledTimes(1);
        expect(userController.userLogin).toHaveBeenCalledTimes(1);
        expect(userController.handlerCookiesToken).toHaveBeenCalledTimes(1);
    });
});
