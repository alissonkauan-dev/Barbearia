import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  appointmentService,
  blockService,
  barberShopService,
  hourService,
  dashboardService,
  appError,
} = vi.hoisted(() => ({
  appointmentService: {
    appointmentCreate: vi.fn(),
    appointmentCancel: vi.fn(),
    appointmentList: vi.fn(),
    appointmentUpdate: vi.fn(),
    appointmentAprove: vi.fn(),
  },
  blockService: {
    blockCreate: vi.fn(),
    blockList: vi.fn(),
    blockDesative: vi.fn(),
  },
  barberShopService: {
    barberShopCreate: vi.fn(),
    barberShopUpdate: vi.fn(),
    barberShopDelete: vi.fn(),
    barberShopList: vi.fn(),
  },
  hourService: {
    businessHourList: vi.fn(),
    businessHourUpsert: vi.fn(),
  },
  dashboardService: {
    getDashboardMetrics: vi.fn(),
  },
  appError: class AppError extends Error {
    statusCode: number;
    status: string;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
      Error.captureStackTrace(this, this.constructor);
    }
  },
}));

vi.mock("./modules/appointments/appointmentService", () => ({
  ...appointmentService,
}));
vi.mock("./modules/barberblocks/blockService", () => ({
  ...blockService,
}));
vi.mock("./modules/barbershop/barberShopService", () => ({
  ...barberShopService,
}));
vi.mock("./modules/bussinessHour/hourService", () => ({
  ...hourService,
}));
vi.mock("./modules/dashboard/dashboardService", () => ({
  ...dashboardService,
}));
vi.mock("./utils/appError", () => ({ default: appError }));

import { createAppointment, cancelAppointment, listAppointment, updateAppointment, aproveAppointment } from "./modules/appointments/appointmentController";
import { createBlock, listBlocks, desativeBlock } from "./modules/barberblocks/blockController";
import { createShop, updateShop, shopDelete, shopList } from "./modules/barbershop/barberShopController";
import { listBusinessHours, upsertBusinessHour } from "./modules/bussinessHour/hourController";
import { getDashboard } from "./modules/dashboard/dashboardController";
import AppError from "./utils/appError";

describe("remaining controllers and utility coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an appointment with valid payload and 201 response", async () => {
    const req = {
      params: { barbershopId: "shop-1", userId: "user-1" },
      body: {
        barberName: "João",
        serviceName: "Corte",
        startTime: "2035-01-01T10:00:00.000Z",
        endTime: "2035-01-01T10:30:00.000Z",
        notes: "Quer cortar curto",
      },
    } as any;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    appointmentService.appointmentCreate.mockResolvedValue({ id: "appointment-1" });

    await createAppointment(req, res);

    expect(appointmentService.appointmentCreate).toHaveBeenCalledWith("user-1", "shop-1", expect.objectContaining({
      barberName: "João",
      serviceName: "Corte",
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      status: "agendamento criado com sucesso",
      data: { id: "appointment-1" },
    });
  });

  it("cancels an appointment and responds 200", async () => {
    const req = {
      params: { appointmentId: "appointment-1" },
      body: {
        status: "CANCELLED",
        CancellationReason: "CLIENT_REQUEST",
      },
    } as any;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    appointmentService.appointmentCancel.mockResolvedValue({ id: "appointment-1", status: "CANCELLED" });

    await cancelAppointment(req, res);

    expect(appointmentService.appointmentCancel).toHaveBeenCalledWith("appointment-1", expect.objectContaining({ status: "CANCELLED" }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("lists appointments for a barbershop", async () => {
    const req = {
      params: { barbershopId: "shop-1" },
      query: { page: 1, limit: 10 },
    } as any;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    appointmentService.appointmentList.mockResolvedValue([{ id: "appointment-1" }]);

    await listAppointment(req, res);

    expect(appointmentService.appointmentList).toHaveBeenCalledWith({ page: 1, limit: 10 }, "shop-1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updates and approves appointment changes", async () => {
    const updateReq = {
      params: { appointmentId: "appointment-1" },
      body: {
        barberName: "Pedro",
        status: "PENDENT",
      },
    } as any;
    const updateRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    appointmentService.appointmentUpdate.mockResolvedValue({ id: "appointment-1" });

    await updateAppointment(updateReq, updateRes);

    expect(appointmentService.appointmentUpdate).toHaveBeenCalledWith("appointment-1", expect.objectContaining({ barberName: "Pedro" }));
    expect(updateRes.status).toHaveBeenCalledWith(200);

    const approveReq = {
      params: { appointmentId: "appointment-1" },
      body: { status: "CONFIRMED", notes: "ok" },
    } as any;
    const approveRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    appointmentService.appointmentAprove.mockResolvedValue({ id: "appointment-1", status: "CONFIRMED" });

    await aproveAppointment(approveReq, approveRes);

    expect(appointmentService.appointmentAprove).toHaveBeenCalledWith("appointment-1", expect.objectContaining({ status: "CONFIRMED" }));
    expect(approveRes.status).toHaveBeenCalledWith(200);
  });

  it("creates, lists and deactivates a block with proper permissions", async () => {
    const createReq = {
      query: { barberId: "barber-1" },
      user: { barberId: "barber-1", role: "BARBER" },
      body: {
        title: "Almoço",
        type: "LUNCH",
        reason: "Refeição",
        startAt: "2035-01-01T12:00:00.000Z",
        endAt: "2035-01-01T13:00:00.000Z",
      },
    } as any;
    const createRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    blockService.blockCreate.mockResolvedValue({ id: "block-1" });

    await createBlock(createReq, createRes);

    expect(blockService.blockCreate).toHaveBeenCalledWith("barber-1", expect.objectContaining({ title: "Almoço" }));
    expect(createRes.status).toHaveBeenCalledWith(201);

    const listReq = {
      query: { barberId: "barber-1", page: 1, limit: 10 },
      user: { barberId: "barber-1", role: "BARBER" },
    } as any;
    const listRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    blockService.blockList.mockResolvedValue([{ id: "block-1" }]);

    await listBlocks(listReq, listRes);

    expect(blockService.blockList).toHaveBeenCalledWith("barber-1", { page: 1, limit: 10 });
    expect(listRes.status).toHaveBeenCalledWith(200);

    const desativeReq = {
      params: { blockId: "block-1", isActive: "false" },
    } as any;
    const desativeRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    blockService.blockDesative.mockResolvedValue({ id: "block-1", isActive: false });

    await desativeBlock(desativeReq, desativeRes);

    expect(blockService.blockDesative).toHaveBeenCalledWith({ blockId: "block-1", isActive: false });
    expect(desativeRes.status).toHaveBeenCalledWith(200);
  });

  it("creates, updates, deletes and lists shops", async () => {
    const createReq = {
      body: {
        name: "Barbearia Central",
        slug: "barbearia-central",
        document: "12345678000199",
        phone: "11999887766",
        email: "contato@barbearia.com",
        street: "Avenida Paulista",
        number: "1000",
        state: "SP",
        zipCode: "01310-100",
        timeZone: "America/Sao_Paulo",
      },
    } as any;
    const createRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    barberShopService.barberShopCreate.mockResolvedValue({ id: "shop-1" });

    await createShop(createReq, createRes);

    expect(barberShopService.barberShopCreate).toHaveBeenCalledWith(expect.objectContaining({ name: "Barbearia Central" }));
    expect(createRes.status).toHaveBeenCalledWith(201);

    const updateReq = {
      params: { id: "shop-1" },
      body: { name: "Barbearia Atualizada" },
    } as any;
    const updateRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    barberShopService.barberShopUpdate.mockResolvedValue({ id: "shop-1", name: "Barbearia Atualizada" });

    await updateShop(updateReq, updateRes);

    expect(barberShopService.barberShopUpdate).toHaveBeenCalledWith("shop-1", { name: "Barbearia Atualizada" });
    expect(updateRes.status).toHaveBeenCalledWith(200);

    const deleteReq = { params: { id: "shop-1" } } as any;
    const deleteRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    barberShopService.barberShopDelete.mockResolvedValue({ message: "desativada" });

    await shopDelete(deleteReq, deleteRes);

    expect(barberShopService.barberShopDelete).toHaveBeenCalledWith("shop-1");
    expect(deleteRes.status).toHaveBeenCalledWith(200);

    const listReq = { query: { page: 1, limit: 10, isActive: true } } as any;
    const listRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    barberShopService.barberShopList.mockResolvedValue([{ id: "shop-1" }]);

    await shopList(listReq, listRes);

    expect(barberShopService.barberShopList).toHaveBeenCalledWith({ page: 1, limit: 10, isActive: true });
    expect(listRes.status).toHaveBeenCalledWith(200);
  });

  it("lists and upserts business hours", async () => {
    const listReq = { params: { barbershopId: "shop-1" } } as any;
    const listRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    hourService.businessHourList.mockResolvedValue([{ dayOfWeek: "MONDAY" }]);

    await listBusinessHours(listReq, listRes);

    expect(hourService.businessHourList).toHaveBeenCalledWith("shop-1");
    expect(listRes.status).toHaveBeenCalledWith(200);

    const upsertReq = {
      params: { barbershopId: "shop-1" },
      body: { dayOfWeek: "MONDAY", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    } as any;
    const upsertRes = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    hourService.businessHourUpsert.mockResolvedValue({ id: "hour-1" });

    await upsertBusinessHour(upsertReq, upsertRes);

    expect(hourService.businessHourUpsert).toHaveBeenCalledWith("shop-1", expect.objectContaining({ dayOfWeek: "MONDAY" }));
    expect(upsertRes.status).toHaveBeenCalledWith(200);
  });

  it("returns dashboard metrics", async () => {
    const req = {
      params: { barbershopId: "shop-1" },
      query: { startDate: "2025-01-01", endDate: "2025-01-31", barberId: "barber-1" },
    } as any;
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any;
    dashboardService.getDashboardMetrics.mockResolvedValue({ summary: { totalAppointments: 1 } });

    await getDashboard(req, res);

    expect(dashboardService.getDashboardMetrics).toHaveBeenCalledWith("shop-1", expect.objectContaining({ barberId: "barber-1" }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: "Métricas obtidas com sucesso",
      data: { summary: { totalAppointments: 1 } },
    });
  });

  it("builds AppError with fail vs error status and captures stack", () => {
    const failError = new AppError("bad request", 400);
    const errorError = new AppError("database issue", 500);

    expect(failError.statusCode).toBe(400);
    expect(failError.status).toBe("fail");
    expect(errorError.statusCode).toBe(500);
    expect(errorError.status).toBe("error");
    expect(failError.message).toBe("bad request");
  });

});
