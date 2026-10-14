import { beforeEach, describe, expect, it, vi } from "vitest";

const { jwt, env } = vi.hoisted(() => ({
    jwt: {
        sign: vi.fn(),
        verify: vi.fn(),
    },
    env: {
        JWT_SECRET: "secret",
        JWT_REFRESH_SECRET: "refresh-secret",
        JWT_EXPIRES_IN: "1h",
        JWT_REFRESH_EXPIRES_IN: "7d",
    },
}));

vi.mock("jsonwebtoken", () => ({ default: jwt }));
vi.mock("../env", () => ({ env }));

import { generatedRefreshToken, generatedToken, verifiRefreshToken } from "./token";

describe("token utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("generates an access token with JWT_SECRET and expiresIn", async () => {
        jwt.sign.mockReturnValue("access-token");

        const token = await generatedToken({ sub: "user-1", email: "user@email.com", role: "ADMIN" });

        expect(token).toBe("access-token");
        expect(jwt.sign).toHaveBeenCalledWith(
            { sub: "user-1", email: "user@email.com", role: "ADMIN" },
            "secret",
            { expiresIn: "1h" },
        );
    });

    it("generates a refresh token with JWT_REFRESH_SECRET and refresh expiry", async () => {
        jwt.sign.mockReturnValue("refresh-token");

        const token = await generatedRefreshToken({ sub: "user-1", email: "user@email.com", role: "ADMIN" });

        expect(token).toBe("refresh-token");
        expect(jwt.sign).toHaveBeenCalledWith(
            { sub: "user-1", email: "user@email.com", role: "ADMIN" },
            "refresh-secret",
            { expiresIn: "7d" },
        );
    });

    it("verifies a refresh token and returns the payload", async () => {
        jwt.verify.mockReturnValue({ sub: "user-1", email: "user@email.com", role: "ADMIN" });

        const payload = await verifiRefreshToken("refresh-token");

        expect(payload).toEqual({ sub: "user-1", email: "user@email.com", role: "ADMIN" });
        expect(jwt.verify).toHaveBeenCalledWith("refresh-token", "refresh-secret");
    });
});
