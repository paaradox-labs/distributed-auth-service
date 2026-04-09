import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request, { type Response } from "supertest";
import bcrypt from "bcrypt";
import { User } from "../../src/entity/User.js";
import { Roles } from "../../src/constants/index.js";
import type { JWKSMock } from "mock-jwks";
import { getCreateJWKSMock } from "../shims/mock-jwks.js";

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

describe("Auth routes", () => {
    let connection: DataSource;
    let jwks: JWKSMock;

    beforeAll(async () => {
        const createJWKSMock = getCreateJWKSMock();
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
        jwks.start();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        jwks.stop();
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("GET /auth/self", () => {
        describe("Given all fields", () => {
            it("should return the 200 status code", async () => {
                const accessToken = jwks.token({
                    sub: "1",
                    role: Roles.CUSTOMER,
                });
                const response = await request(app)
                    .get("/auth/self")
                    .set("Cookie", [`accessToken=${accessToken}`])
                    .send();
                expect(response.statusCode).toBe(200);
            });

            it("should return the user data", async () => {
                // Register a user first
                const userData = {
                    firstName: "Aditya",
                    lastName: "Vyas",
                    email: "avyas8927@gmail.com",
                    password: "Aditya123",
                };
                const userRepository = connection.getRepository(User);
                const data = await userRepository.save({
                    ...userData,
                    role: Roles.CUSTOMER,
                });
                // Generate TOKEN
                const accessToken = jwks.token({
                    sub: String(data.id),
                    role: data.role,
                });
                // Add token to cookie

                const response = await request(app)
                    .get("/auth/self")
                    .set("Cookie", [`accessToken=${accessToken};`])
                    .send();

                // Assert
                // Check if user id matches with the registerd user.
                expect((response.body as Record<string, string>).id).toBe(
                    data.id,
                );
            });

            it("should not return the password field", async () => {
                const userData = {
                    firstName: "Aditya",
                    lastName: "Vyas",
                    email: "avyas8927@gmail.com",
                    password: "Aditya123",
                };
                const userRepository = connection.getRepository(User);
                const data = await userRepository.save({
                    ...userData,
                    role: Roles.CUSTOMER,
                });
                // Generate TOKEN
                const accessToken = jwks.token({
                    sub: String(data.id),
                    role: data.role,
                });
                // Add token to cookie

                const response = await request(app)
                    .get("/auth/self")
                    .set("Cookie", [`accessToken=${accessToken};`])
                    .send();

                // Assert
                // Check if user id matches with the registerd user.
                expect(
                    response.body as Record<string, string>,
                ).not.toHaveProperty("password");
            });

            it("should not return 401 status code if token does not exists", async () => {
                const userData = {
                    firstName: "Aditya",
                    lastName: "Vyas",
                    email: "avyas8927@gmail.com",
                    password: "Aditya123",
                };
                const userRepository = connection.getRepository(User);
                await userRepository.save({
                    ...userData,
                    role: Roles.CUSTOMER,
                });
                // Add token to cookie
                const response = await request(app).get("/auth/self").send();

                // Assert
                // Check if user id matches with the registerd user.
                expect(response.statusCode).toBe(401);
            });

            // Bearer Header Test
            it("should accept access token from Authorization Bearer header", async () => {
                const accessToken = jwks.token({
                    sub: "1",
                    role: Roles.CUSTOMER,
                });
                const response = await request(app)
                    .get("/auth/self")
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send();
                expect(response.statusCode).toBe(200);
            });

            // Use Cookie if Bearer fails
            it("should fall back to cookie when Bearer value is the literal undefined", async () => {
                const accessToken = jwks.token({
                    sub: "1",
                    role: Roles.CUSTOMER,
                });
                const response = await request(app)
                    .get("/auth/self")
                    .set("Authorization", "Bearer undefined")
                    .set("Cookie", [`accessToken=${accessToken}`])
                    .send();
                expect(response.statusCode).toBe(200);
            });
        });
    });

    describe("POST /auth/logout", () => {
        it("should return 200 when access and refresh tokens are valid", async () => {
            const userData = {
                firstName: "Aditya",
                lastName: "Vyas",
                email: "avyas8927@gmail.com",
                password: "Aditya123",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await connection.getRepository(User).save({
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

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const logoutRes = await request(app)
                .post("/auth/logout")
                .set("Cookie", `accessToken=${accessToken}; ${refreshCookie!}`);

            expect(logoutRes.statusCode).toBe(200);
            expect(logoutRes.body).toEqual({});

            const cleared = getSetCookieHeaders(logoutRes).join(" ");
            expect(cleared).toMatch(/accessToken=/);
            expect(cleared).toMatch(/refreshToken=/);
        });

        it("should return 401 when refresh cookie is missing", async () => {
            const userData = {
                firstName: "Aditya",
                lastName: "Vyas",
                email: "avyas8927@gmail.com",
                password: "Aditya123",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await connection.getRepository(User).save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const res = await request(app)
                .post("/auth/logout")
                .set("Cookie", `accessToken=${accessToken}`);

            expect(res.statusCode).toBe(401);
        });

        it("should return 401 when refresh token is not a valid JWT", async () => {
            const userData = {
                firstName: "Aditya",
                lastName: "Vyas",
                email: "avyas8927@gmail.com",
                password: "Aditya123",
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await connection.getRepository(User).save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const res = await request(app)
                .post("/auth/logout")
                .set(
                    "Cookie",
                    `accessToken=${accessToken}; refreshToken=not-a-jwt`,
                );

            expect(res.statusCode).toBe(401);
        });
    });
});
