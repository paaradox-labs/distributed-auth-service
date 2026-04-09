import { describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import type { Repository } from "typeorm";
import { Tokenservice } from "../../src/services/TokenService.js";
import type { RefreshToken } from "../../src/entity/RefreshTokens.js";

describe("Tokenservice", () => {
    const refreshRepo = {} as unknown as Repository<RefreshToken>;
    const service = new Tokenservice(refreshRepo);

    it("throws when the private key cannot be read", () => {
        const spy = jest.spyOn(fs, "readFileSync").mockImplementation(() => {
            throw new Error("ENOENT");
        });

        expect(() =>
            service.generateAccessToken({ sub: "1", role: "x" }),
        ).toThrow(
            expect.objectContaining({
                status: 500,
                message: "Error while reading private key",
            }),
        );

        spy.mockRestore();
    });
});
