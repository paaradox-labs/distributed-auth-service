import { describe, expect, it, jest } from "@jest/globals";
import type { Response } from "express";
import { TenantController } from "../../src/controller/TenantController.js";
import type { TenantService } from "../../src/services/TenantService.js";
import type { Logger } from "winston";
import { mockFn } from "../helpers/mock-fn.js";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;
}

describe("TenantController catch paths", () => {
    const logger = {
        debug: jest.fn(),
        info: jest.fn(),
    } as unknown as Logger;

    it("create forwards service errors to next", async () => {
        const tenantService = {
            create: mockFn().mockRejectedValue(new Error("fail")),
        } as unknown as TenantService;
        const controller = new TenantController(tenantService, logger);
        const next = jest.fn();

        await controller.create(
            {
                body: { name: "A", address: "B" },
            } as unknown as Parameters<TenantController["create"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("getAll forwards service errors to next", async () => {
        const tenantService = {
            getAll: mockFn().mockRejectedValue(new Error("fail")),
        } as unknown as TenantService;
        const controller = new TenantController(tenantService, logger);
        const next = jest.fn();

        await controller.getAll(
            {} as Parameters<TenantController["getAll"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("getOne forwards service errors to next", async () => {
        const tenantService = {
            getById: mockFn().mockRejectedValue(new Error("fail")),
        } as unknown as TenantService;
        const controller = new TenantController(tenantService, logger);
        const next = jest.fn();

        await controller.getOne(
            {
                params: { id: "1" },
            } as unknown as Parameters<TenantController["getOne"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("update forwards service errors to next", async () => {
        const tenantService = {
            update: mockFn().mockRejectedValue(new Error("fail")),
        } as unknown as TenantService;
        const controller = new TenantController(tenantService, logger);
        const next = jest.fn();

        await controller.update(
            {
                body: { name: "A", address: "B" },
                params: { id: "1" },
            } as unknown as Parameters<TenantController["update"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("destroy forwards service errors to next", async () => {
        const tenantService = {
            deleteById: mockFn().mockRejectedValue(new Error("fail")),
        } as unknown as TenantService;
        const controller = new TenantController(tenantService, logger);
        const next = jest.fn();

        await controller.destroy(
            {
                params: { id: "1" },
            } as unknown as Parameters<TenantController["destroy"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
