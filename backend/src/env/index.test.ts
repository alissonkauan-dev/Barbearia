import { afterEach, describe, expect, it, vi } from "vitest";

describe("env configuration", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("accepts lowercase and test node env values", async () => {
    process.env.NODE_ENV = "test";
    process.env.PORT = "3000";
    process.env.HOST = "localhost";
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/backend";
    process.env.JWT_SECRET = "secret";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.JWT_REFRESH_SECRET = "refresh-secret";
    process.env.JWT_REFRESH_EXPIRES_IN = "7d";
    process.env.COOKIES_SECRET = "cookie-secret";

    vi.resetModules();
    const mod = await import("./index");

    expect(mod.env.NODE_ENV).toBe("TEST");
  });
});
