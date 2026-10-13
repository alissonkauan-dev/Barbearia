import prisma from "../../database/prisma";
import * as Schema from "./hourSchema";

export async function businessHourList(barbershopId: string) {
    const barbershop = await prisma.barbershop.findUnique({
        where: { id: barbershopId }
    });

    if (!barbershop) throw new Error("Barbearia não encontrada");

    const hours = await prisma.businessHour.findMany({
        where: { barbershopId },
        orderBy: { dayOfWeek: "asc" } // Podes ordenar ou mapear conforme a ordem dos dias
    });

    return hours;
}

export async function businessHourUpsert(barbershopId: string, body: Schema.BusinessHourUpsertType) {
    const data = Schema.businessHourUpsertSchema.parse(body);

    const barbershop = await prisma.barbershop.findUnique({
        where: { id: barbershopId }
    });

    if (!barbershop) throw new Error("Barbearia não encontrada");

    // Como tens uma restrição única [barbershopId, dayOfWeek] no Prisma, usamos upsert
    const businessHour = await prisma.businessHour.upsert({
        where: {
            barbershopId_dayOfWeek: {
                barbershopId,
                dayOfWeek: data.dayOfWeek
            }
        },
        update: {
            isOpen: data.isOpen,
            openTime: data.openTime,
            closeTime: data.closeTime
        },
        create: {
            barbershopId,
            dayOfWeek: data.dayOfWeek,
            isOpen: data.isOpen,
            openTime: data.openTime,
            closeTime: data.closeTime
        }
    });

    return businessHour;
}

// Helper para extrair informações da data no fuso horário da barbearia
export async function getBarbershopLocalDateTime(date: Date, timezone: string = "UTC") {
    // Formata a data para extrair o dia da semana e a hora local no fuso correto
    const formatterOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        weekday: 'long', // 'monday', 'tuesday', etc.
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('pt-BR', formatterOptions);
    const parts = formatter.formatToParts(date);

    let weekday = '';
    let hour = '';
    let minute = '';

    for (const part of parts) {
        if (part.type === 'weekday') weekday = part.value.toUpperCase();
        if (part.type === 'hour') hour = part.value;
        if (part.type === 'minute') minute = part.value;
    }

    return {
        dayOfWeek: weekday as "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY",
        timeString: `${hour}:${minute}` // Ex: "14:30"
    };
}