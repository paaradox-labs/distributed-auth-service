import { describe, expect, it, jest } from "@jest/globals";
import type { Response } from "express";
import { AuthController } from "../../src/controller/AuthController.js";
import type { CredentialService } from "../../src/services/CredentialService.js";
import type { Tokenservice } from "../../src/services/TokenService.js";
import type { UserService } from "../../src/services/UserService.js";
import type { Logger } from "winston";
import { mockFn } from "../helpers/mock-fn.js";

function mockRes(): Response {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis(),
    } as unknown as Response;
}

describe("AuthController catch paths and refresh guard", () => {
    const logger = {
        debug: jest.fn(),
        info: jest.fn(),
    } as unknown as Logger;

    it("register forwards service errors to next", async () => {
        const userService = {
            create: mockFn().mockRejectedValue(new Error("fail")),
        } as unknown as UserService;
        const tokenService = {
            generateAccessToken: jest.fn(),
            persistRefreshToken: jest.fn(),
            generateRefreshToken: jest.fn(),
        } as unknown as Tokenservice;
        const credentialService = {} as unknown as CredentialService;

        const controller = new AuthController(
            userService,
            logger,
            tokenService,
            credentialService,
        );
        const next = jest.fn();

        await controller.register(
            {
                body: {
                    firstName: "A",
                    lastName: "B",
                    email: "a@b.com",
                    password: "longpassword",
                },
            } as Parameters<AuthController["register"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("login forwards unexpected errors to next", async () => {
        const userService = {
            findByEmail: mockFn().mockRejectedValue(new Error("db")),
        } as unknown as UserService;
        const tokenService = {} as unknown as Tokenservice;
        const credentialService = {} as unknown as CredentialService;

        const controller = new AuthController(
            userService,
            logger,
            tokenService,
            credentialService,
        );
        const next = jest.fn();

        await controller.login(
            {
                body: { email: "a@b.com", password: "longpassword1" },
            } as Parameters<AuthController["login"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("refresh calls next when the user no longer exists", async () => {
        const userService = {
            findById: mockFn().mockResolvedValue(null),
        } as unknown as UserService;
        const tokenService = {
            generateAccessToken: mockFn().mockReturnValue("token"),
        } as unknown as Tokenservice;
        const credentialService = {} as unknown as CredentialService;

        const controller = new AuthController(
            userService,
            logger,
            tokenService,
            credentialService,
        );
        const next = jest.fn();

        await controller.refresh(
            {
                auth: { sub: "1", role: "x", id: "1" },
            } as Parameters<AuthController["refresh"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 400,
                message: "User with the token could not find",
            }),
        );
    });

    it("refresh forwards errors from token persistence to next", async () => {
        const userService = {
            findById: mockFn().mockResolvedValue({
                id: 1,
                role: "x",
            }),
        } as unknown as UserService;
        const tokenService = {
            generateAccessToken: mockFn().mockReturnValue("token"),
            persistRefreshToken: mockFn().mockRejectedValue(new Error("fail")),
            generateRefreshToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
        } as unknown as Tokenservice;
        const credentialService = {} as unknown as CredentialService;

        const controller = new AuthController(
            userService,
            logger,
            tokenService,
            credentialService,
        );
        const next = jest.fn();

        await controller.refresh(
            {
                auth: { sub: "1", role: "x", id: "1" },
            } as Parameters<AuthController["refresh"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("refresh includes tenant in payload when user has a tenant", async () => {
        const userService = {
            findById: mockFn().mockResolvedValue({
                id: 1,
                role: "manager",
                tenant: { id: 5 },
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
            }),
        } as unknown as UserService;
        const tokenService = {
            generateAccessToken: mockFn().mockReturnValue("token"),
            persistRefreshToken: mockFn().mockResolvedValue({ id: "123" }),
            generateRefreshToken: mockFn().mockReturnValue("refresh"),
            deleteRefreshToken: mockFn(),
        } as unknown as Tokenservice;
        const credentialService = {} as unknown as CredentialService;

        const controller = new AuthController(
            userService,
            logger,
            tokenService,
            credentialService,
        );
        const next = jest.fn();
        const res = mockRes();

        await controller.refresh(
            {
                auth: { sub: "1", role: "manager", id: "1" },
            } as Parameters<AuthController["refresh"]>[0],
            res,
            next,
        );

        expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
            expect.objectContaining({ tenant: "5" }),
        );
        expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("logout forwards errors to next", async () => {
        const userService = {} as unknown as UserService;
        const tokenService = {
            deleteRefreshToken: mockFn().mockRejectedValue(new Error("fail")),
        } as unknown as Tokenservice;
        const credentialService = {} as unknown as CredentialService;

        const controller = new AuthController(
            userService,
            logger,
            tokenService,
            credentialService,
        );
        const next = jest.fn();

        await controller.logout(
            {
                auth: { sub: "1", role: "x", id: "1" },
            } as Parameters<AuthController["logout"]>[0],
            mockRes(),
            next,
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
