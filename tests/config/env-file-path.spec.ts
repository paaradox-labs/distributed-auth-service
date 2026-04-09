import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveEnvFilePath } from "../../src/config/env-file-path.js";

describe("resolveEnvFilePath", () => {
    let tmpDir: string;
    let configDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "auth-service-env-path-"),
        );
        fs.writeFileSync(
            path.join(tmpDir, "package.json"),
            JSON.stringify({ name: "fake-root", private: true }),
        );
        configDir = path.join(tmpDir, "src", "config");
        fs.mkdirSync(configDir, { recursive: true });
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("uses dev when NODE_ENV is undefined", () => {
        expect(resolveEnvFilePath(undefined, configDir)).toBe(
            path.join(tmpDir, ".env.dev"),
        );
    });

    it("uses dev when NODE_ENV is empty string", () => {
        expect(resolveEnvFilePath("", configDir)).toBe(
            path.join(tmpDir, ".env.dev"),
        );
    });

    it("uses the given NODE_ENV when set", () => {
        expect(resolveEnvFilePath("test", configDir)).toBe(
            path.join(tmpDir, ".env.test"),
        );
        expect(resolveEnvFilePath("production", configDir)).toBe(
            path.join(tmpDir, ".env.production"),
        );
    });

    it("throws when no package.json exists above the config directory", () => {
        const orphanRoot = fs.mkdtempSync(
            path.join(os.tmpdir(), "auth-service-env-no-pkg-"),
        );
        const deepDir = path.join(orphanRoot, "a", "b", "c");
        fs.mkdirSync(deepDir, { recursive: true });
        try {
            expect(() => resolveEnvFilePath(undefined, deepDir)).toThrow(
                `Could not find package.json above ${deepDir}`,
            );
        } finally {
            fs.rmSync(orphanRoot, { recursive: true, force: true });
        }
    });
});
