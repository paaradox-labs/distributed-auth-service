import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Config } from "../src/config/index.js";
import { mockFn } from "./helpers/mock-fn.js";

const mockListen = mockFn();
const mockInitialize = mockFn();

jest.unstable_mockModule("../src/app.js", () => ({
    default: {
        listen: mockListen,
    },
}));

jest.unstable_mockModule("../src/config/data-source.js", () => ({
    AppDataSource: {
        initialize: mockInitialize,
    },
}));

const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

jest.unstable_mockModule("../src/config/logger.js", () => ({
    default: {
        info: mockLoggerInfo,
        error: mockLoggerError,
    },
}));

describe("startServer", () => {
    beforeEach(() => {
        mockListen.mockReset();
        mockListen.mockImplementation((...args: unknown[]) => {
            const cb = args[1] as (() => void) | undefined;
            cb?.();
        });
        mockInitialize.mockReset();
        mockInitialize.mockResolvedValue(undefined);
        mockLoggerInfo.mockReset();
        mockLoggerError.mockReset();
    });

    it("connects the database, listens, and logs ready", async () => {
        const { startServer } = await import("../src/server.js");
        await startServer();

        expect(mockInitialize).toHaveBeenCalledTimes(1);
        expect(mockLoggerInfo).toHaveBeenCalledWith(
            "Database connected successfully",
        );
        expect(mockListen).toHaveBeenCalledWith(
            Config.PORT,
            expect.any(Function),
        );
        expect(mockLoggerInfo).toHaveBeenCalledWith(
            `Server listening on port: ${Config.PORT}. Click here to open http://localhost:${Config.PORT}`,
        );
    });

    it("logs startup failure and exits with code 1", async () => {
        mockInitialize.mockRejectedValue(new Error("db unavailable"));

        const exitSpy = jest.spyOn(process, "exit").mockImplementation((() => {
            throw new Error("process.exit called");
        }) as typeof process.exit);

        const { startServer } = await import("../src/server.js");

        await expect(startServer()).rejects.toThrow("process.exit called");
        expect(mockLoggerError).toHaveBeenCalledWith(
            "Failed to start server: Error: db unavailable",
        );
        expect(exitSpy).toHaveBeenCalledWith(1);

        exitSpy.mockRestore();
    });

    it("runs startServer when this file is the process entrypoint", async () => {
        const serverPath = fileURLToPath(
            new URL("../src/server.ts", import.meta.url),
        );
        const prevArgv = process.argv;
        process.argv = ["node", serverPath];
        jest.resetModules();

        try {
            await import("../src/server.js");
            await new Promise<void>((resolve) => {
                setImmediate(resolve);
            });
            expect(mockInitialize).toHaveBeenCalled();
            expect(mockListen).toHaveBeenCalled();
        } finally {
            process.argv = prevArgv;
        }
    });
});
