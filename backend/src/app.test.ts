import { describe, expect, it } from "vitest";
import app from "./app";

describe("app bootstrap", () => {
  it("requires authentication for swagger docs", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/docs",
    });

    expect(response.statusCode).toBe(401);
  });
});
