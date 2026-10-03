import "fastify";
import { UserRole } from "../middlewares/authorize";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: UserRoles;
      barbershopId?: string;
      barberId?: string;
    };
  }
}