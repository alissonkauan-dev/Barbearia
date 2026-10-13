import { z } from "zod";

export const appointmentCreateSchema = z.object({
    barberName: z.string( "O nome do barbeiro deve ser uma string válida"),
    serviceName: z.string( "O nome do serviço deve ser uma string válida" ),
    startTime: z.coerce.date( "O horário de início deve ser uma data válida" ),
    endTime: z.coerce.date( "O horário de término deve ser uma data válida"),
    notes: z.string().optional(),
});

export const appointmentUpdateSchema = z.object({
    barberName: z.string().optional(),
    serviceName: z.string().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    notes: z.string().optional(),
    status: z.enum(["SCHEDULED", "PENDENT", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
    CancellationReason: z.enum(["CLIENT_REQUEST", "BARBERSHOP_REQUEST", "OTHER"]).optional(),
});

export const appointmentAproveSchema = z.object({
    status: z.enum(["SCHEDULED", "PENDENT", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
    CancellationReason: z.enum(["CLIENT_REQUEST", "BARBERSHOP_REQUEST", "OTHER"]).optional(),
    notes: z.string().optional(),
});

export type AppointmentAproveType = z.infer<typeof appointmentAproveSchema>;
export type AppointmentCreateType = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdateType = z.infer<typeof appointmentUpdateSchema>;