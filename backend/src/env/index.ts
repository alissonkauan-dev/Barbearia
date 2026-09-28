import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envConfig = z.object({
  NODE_ENV: z
    .enum(["DEVELOPMENT", "PRODUCTION"])
    .default("DEVELOPMENT"),

  PORT: z.coerce.number(),

  HOST: z.string().default("localhost"),

  DATABASE_URL: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  
  COOKIES_SECRET: z.string()
});

const _env = envConfig.safeParse(process.env);

if (!_env.success) {
  console.error(
    "Invalid environment variables",
    _env.error.format()
  );

  throw new Error("Invalid environment variables");
}

export const env = _env.data;