import { describe, expect, it, jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "http-errors";
import { globalErrorHandler } from "../../src/middlewares/globalErrorHandler.js";

function mockReq(): Request {
    return { path: "/test", method: "GET" } as Request;
}

function mockRes(): Response {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    return res as unknown as Response;
}

describe("globalErrorHandler", () => {
    const OLD_ENV = process.env.NODE_ENV;

    afterAll(() => {
        process.env.NODE_ENV = OLD_ENV;
    });

    it("defaults to 500 when err.status is not set", () => {
        const err = { message: "something broke" } as HttpError;
        const req = mockReq();
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        globalErrorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("uses err.status when set", () => {
        const err = { status: 400, message: "bad request" } as HttpError;
        const req = mockReq();
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        globalErrorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("includes the error message for 400 errors", () => {
        const err = {
            status: 400,
            name: "BadRequest",
            message: "bad input",
        } as HttpError;
        const req = mockReq();
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        globalErrorHandler(err, req, res, next);

        const jsonArg = (res.json as jest.Mock).mock.calls[0][0] as {
            errors: { msg: string }[];
        };
        expect(jsonArg.errors[0].msg).toBe("bad input");
    });

    it("hides the stack trace in production", () => {
        process.env.NODE_ENV = "production";
        const err = {
            status: 500,
            name: "Error",
            message: "fail",
            stack: "Error: fail\n    at Object.<anonymous>",
        } as HttpError;
        const req = mockReq();
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        globalErrorHandler(err, req, res, next);

        const jsonArg = (res.json as jest.Mock).mock.calls[0][0] as {
            errors: { stack: unknown }[];
        };
        expect(jsonArg.errors[0].stack).toBeNull();
    });

    it("includes the stack trace in development", () => {
        process.env.NODE_ENV = "development";
        const err = {
            status: 500,
            name: "Error",
            message: "fail",
            stack: "Error: fail\n    at Object.<anonymous>",
        } as HttpError;
        const req = mockReq();
        const res = mockRes();
        const next = jest.fn() as NextFunction;

        globalErrorHandler(err, req, res, next);

        const jsonArg = (res.json as jest.Mock).mock.calls[0][0] as {
            errors: { stack: unknown }[];
        };
        expect(jsonArg.errors[0].stack).toBe(err.stack);
    });
});
