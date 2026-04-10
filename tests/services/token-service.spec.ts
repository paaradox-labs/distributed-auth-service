import { describe, expect, it } from "@jest/globals";
import type { Repository } from "typeorm";
import { Config } from "../../src/config/index.js";
import { Tokenservice } from "../../src/services/TokenService.js";
import type { RefreshToken } from "../../src/entity/RefreshTokens.js";

describe("Tokenservice", () => {
    const refreshRepo = {} as unknown as Repository<RefreshToken>;
    const service = new Tokenservice(refreshRepo);

    it("throws when PRIVATE_KEY is not set", () => {
        const saved = Config.PRIVATE_KEY;
        Config.PRIVATE_KEY = undefined;
        try {
            expect(() =>
                service.generateAccessToken({ sub: "1", role: "x" }),
            ).toThrow(
                expect.objectContaining({
                    status: 500,
                    message: "SECRET_KEY is not set",
                }),
            );
        } finally {
            Config.PRIVATE_KEY = saved;
        }
    });
});
