import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { env } from "./env";
import { authMiddleware } from "./middlewares/auth";
import { userRoutes } from "./modules/User/usuarioRoutes";
import { servicesRoutes } from "./modules/services/servicesRoutes";
import { barberRoutes } from "./modules/barber/barberRoutes";
import { blockRoutes } from "./modules/barberblocks/blockRoutes";
import { appointmentRoutes } from "./modules/appointments/appointmentRoutes";
import { businessHourRoutes } from "./modules/bussinessHour/hourRoutes";
import { shopRoutes } from "./modules/barbershop/barberShoRoutes";
import { dashboardRoutes } from "./modules/dashboard/dashboardRoutes";

const app = fastify({
  logger: false,
});

app.register(fastifyCookie, {
  secret: env.COOKIES_SECRET,
});

app.register(swagger, {
  openapi: {
    info: {
      title: "Barber Backend API",
      description: "API para gestão de barbearia, usuários e agendamentos.",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://${env.HOST}:${env.PORT}`,
        description: "Local server",
      },
    ],
  },
});

app.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  theme: {
    title: "Barber API Docs",
  },
});

app.addHook("onRequest", async (request, reply) => {
  const url = request.raw.url ?? "";

  if (!url.startsWith("/docs")) {
    return;
  }

  await authMiddleware(request as any, reply as any);

  if (reply.sent) {
    return;
  }
});

const API = "/api/v1";

app.get("/health", async () => ({
  ok: true,
  message: "server up",
  timestamp: new Date().toISOString(),
}));


app.register(userRoutes, {
  prefix: `${API}/usuario`,
});
app.register(servicesRoutes, {
  prefix: API,
});
app.register(barberRoutes, {
  prefix: API,
});
app.register(blockRoutes, {
  prefix: API,
});
app.register(appointmentRoutes, {
  prefix: API,
});
app.register(businessHourRoutes, {
  prefix: API,
});
app.register(shopRoutes, {
  prefix: API,
});
app.register(dashboardRoutes, {
  prefix: API,
});

app.setErrorHandler((error, _request, reply) => {
  const statusCode = error.statusCode ?? 500;

  reply.status(statusCode).send({
    error: error.name,
    message: error.message,
  });
});

export default app;
