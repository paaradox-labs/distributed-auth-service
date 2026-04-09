import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import bcrypt from "bcrypt";
import { User } from "../../src/entity/User.js";
import { Roles } from "../../src/constants/index.js";
import request, { type Response } from "supertest";
import app from "../../src/app.js";
import { isJWT } from "../utils/index.js";
import { RefreshToken } from "../../src/entity/RefreshTokens.js";

function getSetCookieHeaders(res: Response): string[] {
    const raw = res.headers["set-cookie"];
    if (!raw) {
        return [];
    }
    return Array.isArray(raw) ? raw : [raw];
}

function extractCookie(
    setCookie: string[] | undefined,
    name: string,
): string | null {
    if (!setCookie?.length) {
        return null;
    }
    for (const cookie of setCookie) {
        if (cookie.startsWith(`${name}=`)) {
            return cookie.split(";")[0] ?? null;
        }
    }
    return null;
}

describe("POST /auth/refresh", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection?.isInitialized) {
            await connection.destroy();
        }
    });

    it("should issue new tokens when refresh cookie is valid", async () => {
        const userData = {
            firstName: "Aditya",
            lastName: "Vyas",
            email: "avyas8927@gmail.com",
            password: "Aditya123",
        };

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await connection.getRepository(User).save({
            ...userData,
            password: hashedPassword,
            role: Roles.CUSTOMER,
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: userData.email,
            password: userData.password,
        });

        expect(loginRes.statusCode).toBe(200);

        const refreshCookie = extractCookie(
            getSetCookieHeaders(loginRes),
            "refreshToken",
        );
        expect(refreshCookie).not.toBeNull();

        const refreshRes = await request(app)
            .post("/auth/refresh")
            .set("Cookie", refreshCookie!);

        expect(refreshRes.statusCode).toBe(200);
        expect(refreshRes.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
            }),
        );

        const newAccess = extractCookie(
            getSetCookieHeaders(refreshRes),
            "accessToken",
        );
        const newRefresh = extractCookie(
            getSetCookieHeaders(refreshRes),
            "refreshToken",
        );
        expect(newAccess).not.toBeNull();
        expect(newRefresh).not.toBeNull();
        const accessVal = newAccess!.slice(newAccess!.indexOf("=") + 1);
        const refreshVal = newRefresh!.slice(newRefresh!.indexOf("=") + 1);
        expect(isJWT(accessVal)).toBe(true);
        expect(isJWT(refreshVal)).toBe(true);
    });

    it("should return 401 when refresh cookie is missing", async () => {
        const res = await request(app).post("/auth/refresh").send();
        expect(res.statusCode).toBe(401);
    });

    it("should return 401 when refresh token is not a valid JWT", async () => {
        const res = await request(app)
            .post("/auth/refresh")
            .set("Cookie", "refreshToken=not-a-jwt");

        expect(res.statusCode).toBe(401);
    });

    it("should return 401 when refresh token row was removed (revoked)", async () => {
        const userData = {
            firstName: "Aditya",
            lastName: "Vyas",
            email: "avyas8927@gmail.com",
            password: "Aditya123",
        };

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await connection.getRepository(User).save({
            ...userData,
            password: hashedPassword,
            role: Roles.CUSTOMER,
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: userData.email,
            password: userData.password,
        });

        const refreshCookie = extractCookie(
            getSetCookieHeaders(loginRes),
            "refreshToken",
        );
        expect(refreshCookie).not.toBeNull();

        await connection.getRepository(RefreshToken).clear();

        const refreshRes = await request(app)
            .post("/auth/refresh")
            .set("Cookie", refreshCookie!);

        expect(refreshRes.statusCode).toBe(401);
    });

    it("should return 401 when refresh token lookup throws", async () => {
        const userData = {
            firstName: "Aditya",
            lastName: "Vyas",
            email: "avyas8927@gmail.com",
            password: "Aditya123",
        };

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await connection.getRepository(User).save({
            ...userData,
            password: hashedPassword,
            role: Roles.CUSTOMER,
        });

        const loginRes = await request(app).post("/auth/login").send({
            email: userData.email,
            password: userData.password,
        });

        const refreshCookie = extractCookie(
            getSetCookieHeaders(loginRes),
            "refreshToken",
        );
        expect(refreshCookie).not.toBeNull();

        const refreshRepo = AppDataSource.getRepository(RefreshToken);
        const originalFindOne = refreshRepo.findOne.bind(refreshRepo);
        refreshRepo.findOne = async () => {
            throw new Error("forced db error");
        };

        let refreshRes;
        try {
            refreshRes = await request(app)
                .post("/auth/refresh")
                .set("Cookie", refreshCookie!);
        } finally {
            refreshRepo.findOne = originalFindOne;
        }

        expect(refreshRes.statusCode).toBe(401);
    });
});
