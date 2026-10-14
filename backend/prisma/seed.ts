import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/barbearia?schema=public",
  }),
});

async function main() {
  const barbershop = await prisma.barbershop.upsert({
    where: { slug: "barbearia-central" },
    update: {},
    create: {
      name: "Barbearia Central",
      slug: "barbearia-central",
      document: "12345678000199",
      phone: "11999999999",
      email: "contato@barbearia-central.com",
      description: "Barbearia de teste para desenvolvimento",
      street: "Avenida Paulista",
      number: "1000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      timezone: "America/Sao_Paulo",
      isActive: true,
    },
  });

  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: {
      barbershopId_email: {
        barbershopId: barbershop.id,
        email: "admin@barbearia-central.com",
      },
    },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@barbearia-central.com",
      passwordHash: adminPassword,
      phone: "11988887777",
      role: "ADMIN",
      status: "ACTIVE",
      barbershopId: barbershop.id,
    },
  });

  const barberPassword = await hash("barbeiro123", 10);
  const barberUser = await prisma.user.upsert({
    where: {
      barbershopId_email: {
        barbershopId: barbershop.id,
        email: "barbeiro@barbearia-central.com",
      },
    },
    update: {},
    create: {
      name: "José Barbeiro",
      email: "barbeiro@barbearia-central.com",
      passwordHash: barberPassword,
      phone: "11977776666",
      role: "BARBER",
      status: "ACTIVE",
      barbershopId: barbershop.id,
    },
  });

  const barber = await prisma.barber.upsert({
    where: { userId: barberUser.id },
    update: {},
    create: {
      userId: barberUser.id,
      barbershopId: barbershop.id,
      bio: "Barbeiro especializado em cortes modernos",
      isActive: true,
    },
  });

  const clientUser = await prisma.user.upsert({
    where: {
      barbershopId_email: {
        barbershopId: barbershop.id,
        email: "cliente@barbearia-central.com",
      },
    },
    update: {},
    create: {
      name: "Cliente Teste",
      email: "cliente@barbearia-central.com",
      passwordHash: await hash("cliente123", 10),
      phone: "11966665555",
      role: "CLIENT",
      status: "ACTIVE",
      barbershopId: barbershop.id,
    },
  });

  const client = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      barbershopId: barbershop.id,
      notes: "Cliente de teste",
      isActive: true,
    },
  });

  const service = await prisma.service.upsert({
    where: {
      id: "seed-service-corte-clasico",
    },
    update: {
      name: "Corte Clássico",
      description: "Corte tradicional com acabamento",
      price: 60,
      durationMin: 45,
      isActive: true,
    },
    create: {
      id: "seed-service-corte-clasico",
      barbershopId: barbershop.id,
      name: "Corte Clássico",
      description: "Corte tradicional com acabamento",
      price: 60,
      durationMin: 45,
      isActive: true,
    },
  });

  await prisma.barberService.upsert({
    where: {
      barberId_serviceId: {
        barberId: barber.id,
        serviceId: service.id,
      },
    },
    update: {},
    create: {
      barberId: barber.id,
      serviceId: service.id,
    },
  });

  await prisma.businessHour.upsert({
    where: {
      barbershopId_dayOfWeek: {
        barbershopId: barbershop.id,
        dayOfWeek: "MONDAY",
      },
    },
    update: {},
    create: {
      barbershopId: barbershop.id,
      dayOfWeek: "MONDAY",
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointmentEnd = new Date(tomorrow.getTime() + 45 * 60 * 1000);

  await prisma.appointment.upsert({
    where: {
      id: "seed-appointment-1",
    },
    update: {},
    create: {
      id: "seed-appointment-1",
      barbershopId: barbershop.id,
      clientId: client.id,
      barberId: barber.id,
      serviceId: service.id,
      startAt: tomorrow,
      endAt: appointmentEnd,
      status: "SCHEDULED",
      serviceName: service.name,
      servicePrice: service.price,
      durationMin: service.durationMin,
      clientNotes: "Primeiro agendamento de teste",
    },
  });

  console.log("Seed concluída com sucesso.");
  console.log({
    barbershop: barbershop.slug,
    admin: admin.email,
    barber: barberUser.email,
    client: clientUser.email,
    password: "admin123 / barbeiro123 / cliente123",
  });
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
