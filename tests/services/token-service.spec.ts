import { describe, expect, it, afterEach } from "@jest/globals";
import { generateKeyPairSync } from "node:crypto";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import type { Repository } from "typeorm";
import { Tokenservice } from "../../src/services/TokenService.js";
import type { RefreshToken } from "../../src/entity/RefreshTokens.js";

const CERTS_DIR = "certs";
const KEY_PATH = "certs/private.pem";

describe("Tokenservice", () => {
    const refreshRepo = {} as unknown as Repository<RefreshToken>;
    const service = new Tokenservice(refreshRepo);

    describe("generateAccessToken", () => {
        afterEach(() => {
            if (existsSync(KEY_PATH)) {
                unlinkSync(KEY_PATH);
            }
        });

        it("throws when the private key file cannot be read", () => {
            if (existsSync(KEY_PATH)) {
                unlinkSync(KEY_PATH);
            }

            expect(() =>
                service.generateAccessToken({ sub: "1", role: "x" }),
            ).toThrow(
                expect.objectContaining({
                    status: 500,
                    message: "Error while reading the private key",
                }),
            );
        });

        it("returns a signed JWT when the private key is available", () => {
            mkdirSync(CERTS_DIR, { recursive: true });
            const { privateKey } = generateKeyPairSync("rsa", {
                modulusLength: 2048,
                privateKeyEncoding: { type: "pkcs1", format: "pem" },
            });
            writeFileSync(KEY_PATH, privateKey);

            const token = service.generateAccessToken({ sub: "1", role: "x" });

            expect(token).toEqual(expect.any(String));
        });
    });
});
