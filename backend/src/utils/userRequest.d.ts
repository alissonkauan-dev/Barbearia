import "fastify";
import { UserRole } from "../middlewares/authorize";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      role: UserRole;
      barbershopId?: string;
      userId?: string;
    };
  }
}