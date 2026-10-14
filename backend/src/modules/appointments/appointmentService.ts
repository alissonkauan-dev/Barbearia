import prisma from "../../database/prisma";
import * as Schema from "./appointmenSchema"
import { businessHourList, getBarbershopLocalDateTime } from "../bussinessHour/hourService"

interface PaginationParams {
    page?: number;
    limit?: number;
    barberShopId?: string;
    date?: Date;
}

export async function appointmentCreate(userId: string, barberShopId: string, body: Schema.AppointmentCreateType) {
    const data = Schema.appointmentCreateSchema.parse(body);

    const now = new Date();

    // validações superficial do horario
    if (data.startTime >= data.endTime) throw new Error("O horário de início deve ser menor que o horário de término");
    if (data.startTime < now) throw new Error("O horário de início deve ser maior que o horário atual");
    if (data.endTime < now) throw new Error("O horário de término deve ser maior que o horário atual");

    // procurando a barbearia
    const findBarberShop = await prisma.barbershop.findUnique({
        where: { id: barberShopId }
    });

    if (!findBarberShop) throw new Error("não foi possivel encontrar a barbearia")

    // logica de validação se o horario desejado a barbearia está aberta
    const startLocalDateTime = await getBarbershopLocalDateTime(data.startTime, findBarberShop.timezone)
    const endLocalDateTime = await getBarbershopLocalDateTime(data.endTime, findBarberShop.timezone)

    const businessHour = await prisma.businessHour.findUnique({
        where: {
            barbershopId_dayOfWeek: {
                barbershopId: barberShopId,
                dayOfWeek: startLocalDateTime.dayOfWeek
            }
        }
    })

    if (!businessHour || !businessHour.isOpen) {
        throw new Error(`A barbearia está fechada no dia ${startLocalDateTime.dayOfWeek}`);
    }

    if (businessHour.openTime && businessHour.closeTime) {
        if (
            startLocalDateTime.timeString < businessHour.openTime ||
            endLocalDateTime.timeString > businessHour.closeTime
        ) {
            throw new Error(
                `O horário escolhido (${startLocalDateTime.timeString} - ${endLocalDateTime.timeString}) está fora do expediente (${businessHour.openTime} - ${businessHour.closeTime})`
            );
        }
    }


    // logica barbeiro
    const findBarber = await prisma.$transaction(async (tx) => {
        const userName = await tx.user.findFirst({
            where: {
                AND: [{ name: { contains: data.barberName, mode: "insensitive" } }, { OR: [{ role: "BARBER" }, { role: "ADMIN" }] }]
            }
        });

        const barberIdFind = await tx.barber.findFirst({
            where: { userId: userName?.id }
        });
        return barberIdFind;
    });

    if (!findBarber) throw new Error("Barbeiro não encontrado");

    const findBlock = await prisma.barberBlock.findFirst({
        where: { 
            barberId: findBarber.id,
            AND: [{startAt: { lt: data.endTime }, endAt: { gt: data.startTime }}]
        }
    })

    if(findBlock) throw new Error("Barbeiro não estará disponivel no horario selecionado")


    const findService = await prisma.service.findFirst({
        where: {
            AND: [{ name: { contains: data.serviceName, mode: 'insensitive' } }, { barbershopId: barberShopId }]
        }
    });

    if (!findService) throw new Error("Serviço não encontrado");

    const userExistent = await prisma.user.findUnique({ where: { id: userId } });

    if (!userExistent) throw new Error("Utilizador não encontrado");

    const appointmentDateExistent = await prisma.appointment.findFirst({
        where: {
            barberId: findBarber.id,
            AND: [
                {
                    startAt: { lt: data.endTime },
                    endAt: { gt: data.startTime }
                },
                { status: { not: 'CANCELLED' } }
            ]
        }
    });

    if (appointmentDateExistent) {
        throw new Error("Horário indisponível para o barbeiro selecionado já existe um agendamento neste período");
    }

    try {
        const createdAppointment = await prisma.appointment.create({
            data: {
                barbershopId: findBarberShop.id,
                barberId: findBarber.id,
                serviceId: findService.id,
                clientId: userExistent.id,
                startAt: data.startTime,
                endAt: data.endTime,
                clientNotes: data.notes,
                serviceName: findService.name,
                servicePrice: findService.price,
                durationMin: findService.durationMin
            }
        });

        return createdAppointment;
    }
    catch (error) {
        console.error("Erro ao criar o agendamento: ", error);
        throw new Error("Não foi possível criar o agendamento");
    }
}

export async function appointmentCancel(appointId: string, body: Schema.AppointmentUpdateType) {
    const findAppointment = await prisma.appointment.findFirst({ where: { id: appointId } });
    const data = Schema.appointmentUpdateSchema.parse(body);

    if (!findAppointment) throw new Error('Não foi possível encontrar o agendamento marcado');
    if (data.status !== 'CANCELLED') throw new Error('Erro no cancelamento do agendamento');

    if (data.CancellationReason !== "BARBERSHOP_REQUEST" && data.CancellationReason !== "OTHER") {
        data.CancellationReason = "CLIENT_REQUEST";
    }

    try {
        const appointmentCancelled = await prisma.appointment.update({
            where: { id: findAppointment.id },
            data: {
                status: data.status,
                cancelReason: data.CancellationReason
            }
        });
        return appointmentCancelled;
    }
    catch (error) {
        console.error('Erro no cancelamento do agendamento: ', error);
        throw new Error('Não foi possível cancelar o agendamento');
    }
}

export async function appointmentList({ page = 1, limit = 10 }: PaginationParams = {}, barberShopId: string) {
    const skip = (page - 1) * limit;

    const barberShopExistent = await prisma.barbershop.findFirst({
        where: { id: barberShopId }
    });

    if (!barberShopExistent) throw new Error("Não foi possível localizar a barbearia");

    try {
        const appointments = await prisma.appointment.findMany({
            where: { barbershopId: barberShopExistent.id },
            take: limit,
            skip,
            orderBy: { startAt: "desc" }
        });

        return appointments;
    }
    catch (error) {
        console.error('Erro na listagem dos agendamentos. Error: ', error);
        throw new Error("Não foi possível listar os agendamentos da barbearia");
    }
}

export async function appointmentUpdate(appointId: string, body: Schema.AppointmentUpdateType) {
    const data = Schema.appointmentUpdateSchema.parse(body);
    const appointmentExist = await prisma.appointment.findFirst({
        where: { id: appointId },
        include: {
            barbershop: {
                select: {
                    timezone: true
                }
            }
        }

    });

    if (!appointmentExist) throw new Error("Não foi possível localizar o agendamento");

    try {
        const dataUpdate: any = {};

        if (data.barberName !== undefined) {
            const barberExist = await prisma.$transaction(async (tx) => {
                const userName = await tx.user.findFirst({
                    where: {
                        AND: [{ name: { contains: data.barberName, mode: 'insensitive' } }, { role: 'BARBER' }]
                    }
                });

                const barberIdFind = await tx.barber.findFirst({
                    where: { userId: userName?.id }
                });
                return barberIdFind;
            });

            if (barberExist) {
                dataUpdate.barberId = barberExist.id;
            }
        }
        const targetBarberId = dataUpdate.barberId !== undefined ? dataUpdate.barberId : appointmentExist.barberId;

        if (data.serviceName !== undefined) dataUpdate.serviceName = data.serviceName;
        if (data.startTime !== undefined) dataUpdate.startAt = data.startTime;
        if (data.endTime !== undefined) dataUpdate.endAt = data.endTime;
        if (data.notes !== undefined) dataUpdate.clientNotes = data.notes;

        if (dataUpdate.startAt && dataUpdate.endAt) {
            const startLocalDateTime = await getBarbershopLocalDateTime(dataUpdate.startAt, appointmentExist.barbershop.timezone)
            const endLocalDateTime = await getBarbershopLocalDateTime(dataUpdate.endAt, appointmentExist.barbershop.timezone)


            const businessHour = await prisma.businessHour.findUnique({
                where: {
                    barbershopId_dayOfWeek: {
                        barbershopId: appointmentExist.barbershopId,
                        dayOfWeek: startLocalDateTime.dayOfWeek
                    }
                }
            })

            if (!businessHour || !businessHour.isOpen) throw new Error(`A barbearia está fechada no dia ${startLocalDateTime.dayOfWeek}`);

            if (businessHour.openTime && businessHour.closeTime) {
                if (startLocalDateTime.timeString < businessHour.openTime || endLocalDateTime.timeString > businessHour.closeTime) {
                    throw new Error(
                        `O horário escolhido (${startLocalDateTime.timeString} - ${endLocalDateTime.timeString}) está fora do expediente (${businessHour.openTime} - ${businessHour.closeTime})`
                    );
                }
            }
           

            const findBlock = await prisma.barberBlock.findFirst({
            where: {
                barberId: targetBarberId,
                AND: [{startAt: {lt: dataUpdate.endAt}, endAt: {gt: dataUpdate.startAt}}]
            }
        })

        if(findBlock) throw new Error("o barbeiro não está disponivel no horario selecionado")

        }

        

        dataUpdate.status = "PENDENT";

        const appointmentUpdateResult = await prisma.appointment.update({
            where: { id: appointmentExist.id },
            data: dataUpdate
        });

        return appointmentUpdateResult;
    }
    catch (error) {
        console.error("Erro na atualização do agendamento. ERROR: ", error);
        throw new Error("Não foi possível atualizar o agendamento");
    }
}

export async function appointmentAprove(appointId: string, body: Schema.AppointmentAproveType) {
    const data = Schema.appointmentAproveSchema.parse(body);
    const appointmentExist = await prisma.appointment.findFirst({
        where: { id: appointId }
    });

    if (!appointmentExist) throw new Error("Não foi possível localizar o agendamento");

    try {
        const dataUpdate: any = {};

        if (data.CancellationReason !== undefined) dataUpdate.cancelReason = data.CancellationReason;
        if (data.notes !== undefined) dataUpdate.clientNotes = data.notes;
        if (data.status !== undefined) dataUpdate.status = data.status;

        const appointmentUpdateResult = await prisma.appointment.update({
            where: { id: appointmentExist.id },
            data: dataUpdate
        });
        return appointmentUpdateResult;
    }
    catch (error) {
        console.error("Erro na validação das alterações do agendamento. ERROR: ", error);
        throw new Error("Não foi possível validar as alterações feitas no agendamento");
    }
}