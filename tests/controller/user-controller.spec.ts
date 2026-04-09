import { describe, expect, it, jest } from "@jest/globals";
import type { Response } from "express";
import { UserController } from "../../src/controller/UserController.js";
import type { UserService } from "../../src/services/UserService.js";
import { Roles } from "../../src/constants/index.js";
import type { Logger } from "winston";
import { mockFn } from "../helpers/mock-fn.js";

function mockRes(): Response {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    return res as unknown as Response;
}

describe("UserController catch paths", () => {
    const logger = {
        debug: jest.fn(),
        info: jest.fn(),
    } as unknown as Logger;

    it("create forwards service errors to next", async () => {
        const userService = {
            create: mockFn().mockRejectedValue(new Error("unexpected")),
        } as unknown as UserService;
        const controller = new UserController(userService, logger);
        const next = jest.fn();

        await controller.create(
            {
                body: {
                    firstName: "A",
                    lastName: "B",
                    email: "a@b.com",
                    password: "longpassword1",
                    role: Roles.MANAGER,
                    tenantId: 1,
                },
            } as Parameters<UserController["create"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("update forwards service errors to next", async () => {
        const userService = {
            update: mockFn().mockRejectedValue(new Error("unexpected")),
        } as unknown as UserService;
        const controller = new UserController(userService, logger);
        const next = jest.fn();

        await controller.update(
            {
                body: {
                    firstName: "A",
                    lastName: "B",
                    role: Roles.CUSTOMER,
                },
                params: { id: "1" },
            } as unknown as Parameters<UserController["update"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("getAll forwards service errors to next", async () => {
        const userService = {
            getAll: mockFn().mockRejectedValue(new Error("unexpected")),
        } as unknown as UserService;
        const controller = new UserController(userService, logger);
        const next = jest.fn();

        await controller.getAll(
            {} as Parameters<UserController["getAll"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("getOne forwards service errors to next", async () => {
        const userService = {
            findById: mockFn().mockRejectedValue(new Error("unexpected")),
        } as unknown as UserService;
        const controller = new UserController(userService, logger);
        const next = jest.fn();

        await controller.getOne(
            {
                params: { id: "1" },
            } as unknown as Parameters<UserController["getOne"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("destroy forwards service errors to next", async () => {
        const userService = {
            deleteById: mockFn().mockRejectedValue(new Error("unexpected")),
        } as unknown as UserService;
        const controller = new UserController(userService, logger);
        const next = jest.fn();

        await controller.destroy(
            {
                params: { id: "1" },
            } as unknown as Parameters<UserController["destroy"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
