import { beforeEach, describe, expect, it, vi } from "vitest";

const { serviceModule } = vi.hoisted(() => ({
    serviceModule: {
        createService: vi.fn(),
        updateService: vi.fn(),
        searchServices: vi.fn(),
        deleteService: vi.fn(),
        listServices: vi.fn(),
    },
}));

vi.mock("./servicesService", () => ({
    ...serviceModule,
}));

import {
    createService,
    deleteService,
    listServices,
    searchServices,
    updateService,
} from "./servicesController";

describe("servicesController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a service and responds with 201", async () => {
        const req = { body: { name: "Corte", price: 40, duration: 30, barbershopId: "shop-1" } } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        serviceModule.createService.mockResolvedValue({ id: "service-1" });

        await createService(req, res);

        expect(serviceModule.createService).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith({
            status: "Serviço criado com sucesso",
            data: { id: "service-1" },
        });
    });

    it("updates a service and responds with 200", async () => {
        const req = {
            params: { serviceId: "service-1" },
            body: { name: "Corte premium" },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        serviceModule.updateService.mockResolvedValue({ id: "service-1", name: "Corte premium" });

        await updateService(req, res);

        expect(serviceModule.updateService).toHaveBeenCalledWith("service-1", req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            status: "Serviço atualizado com sucesso",
            data: { id: "service-1", name: "Corte premium" },
        });
    });

    it("lists services from a barbershop with pagination params", async () => {
        const req = {
            params: { barberShopId: "shop-1" },
            query: { page: 2, limit: 5, isActive: true },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        serviceModule.listServices.mockResolvedValue([{ id: "service-1" }]);

        await listServices(req, res);

        expect(serviceModule.listServices).toHaveBeenCalledWith(req.query, "shop-1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            status: "Serviços listados com sucesso",
            data: [{ id: "service-1" }],
        });
    });

    it("searches services by id or name", async () => {
        const req = {
            params: { barberShopId: "shop-1" },
            query: { serviceId: "service-1", name: "Corte" },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        } as any;

        serviceModule.searchServices.mockResolvedValue([{ id: "service-1" }]);

        await searchServices(req, res);

        expect(serviceModule.searchServices).toHaveBeenCalledWith("service-1", "Corte", "shop-1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            status: "Serviços encontrados com sucesso",
            data: [{ id: "service-1" }],
        });
    });

    it("deletes a service and responds with 200", async () => {
        const req = { params: { serviceId: "service-1" } } as any;
        const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;

        serviceModule.deleteService.mockResolvedValue({ id: "service-1" });

        await deleteService(req, res);

        expect(serviceModule.deleteService).toHaveBeenCalledWith("service-1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            status: "Serviço deletado com sucesso",
            data: { id: "service-1" },
        });
    });
});
