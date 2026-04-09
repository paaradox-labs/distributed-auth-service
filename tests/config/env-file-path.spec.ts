import path from "path";
import { resolveEnvFilePath } from "../../src/config/env-file-path.js";

describe("resolveEnvFilePath", () => {
    const configDir = "/project/src/config";

    it("uses dev when NODE_ENV is undefined", () => {
        expect(resolveEnvFilePath(undefined, configDir)).toBe(
            path.join(configDir, "../../.env.dev"),
        );
    });

    it("uses dev when NODE_ENV is empty string", () => {
        expect(resolveEnvFilePath("", configDir)).toBe(
            path.join(configDir, "../../.env.dev"),
        );
    });

    it("uses the given NODE_ENV when set", () => {
        expect(resolveEnvFilePath("test", configDir)).toBe(
            path.join(configDir, "../../.env.test"),
        );
        expect(resolveEnvFilePath("production", configDir)).toBe(
            path.join(configDir, "../../.env.production"),
        );
    });
});
