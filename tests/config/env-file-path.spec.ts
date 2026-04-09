import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveEnvFilePath } from "../../src/config/env-file-path.js";

describe("resolveEnvFilePath", () => {
    const projectRoot = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../..",
    );
    const configDir = path.join(projectRoot, "src", "config");

    it("uses dev when NODE_ENV is undefined", () => {
        expect(resolveEnvFilePath(undefined, configDir)).toBe(
            path.join(projectRoot, ".env.dev"),
        );
    });

    it("uses dev when NODE_ENV is empty string", () => {
        expect(resolveEnvFilePath("", configDir)).toBe(
            path.join(projectRoot, ".env.dev"),
        );
    });

    it("uses the given NODE_ENV when set", () => {
        expect(resolveEnvFilePath("test", configDir)).toBe(
            path.join(projectRoot, ".env.test"),
        );
        expect(resolveEnvFilePath("production", configDir)).toBe(
            path.join(projectRoot, ".env.production"),
        );
    });
});
