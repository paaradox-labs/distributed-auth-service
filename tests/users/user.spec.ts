import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request, { type Response } from "supertest";
import bcrypt from "bcryptjs";
import { User } from "../../src/entity/User.js";
import { Tenant } from "../../src/entity/Tenant.js";
import { Roles } from "../../src/constants/index.js";
import { createTenant } from "../utils/index.js";
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
        jwks.start();
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        jwks?.stop();
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

    describe("userCrud", () => {
        let adminToken: string;

        beforeEach(() => {
            adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
        });

        describe("POST /users", () => {
            let userData: {
                firstName: string;
                lastName: string;
                email: string;
                password: string;
                tenantId: number;
                role: string;
            };
            beforeEach(async () => {
                const tenant = await createTenant(
                    connection.getRepository(Tenant),
                );
                userData = {
                    firstName: "Aditya",
                    lastName: "Vyas",
                    email: "crud-create@example.com",
                    password: "Aditya@123",
                    tenantId: tenant.id,
                    role: Roles.MANAGER,
                };
            });

            it("should persist a user with a hashed password", async () => {
                await request(app)
                    .post("/users")
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send(userData)
                    .expect(201);

                const userRepository = connection.getRepository(User);
                const users = await userRepository.find({
                    select: ["password"],
                });

                expect(users).toHaveLength(1);

                const row = users[0];

                expect(row).toBeDefined();
                expect(row?.password).not.toBe(userData.password);

                const matches = await bcrypt.compare(
                    userData.password,
                    row!.password,
                );

                expect(matches).toBe(true);
            });

            it("should return 400 when the email already exists", async () => {
                await request(app)
                    .post("/users")
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send(userData)
                    .expect(201);

                const response = await request(app)
                    .post("/users")
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send(userData);

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors?: { msg?: string }[] })
                        .errors?.[0]?.msg,
                ).toBe("Email already exisits!");
            });

            it("should return 400 when validation fails on create", async () => {
                const response = await request(app)
                    .post("/users")
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send({
                        lastName: "Vyas",
                        email: "missing-first@example.com",
                        password: "Aditya@123",
                    });

                expect(response.status).toBe(400);
                expect(Array.isArray(response.body.errors)).toBe(true);
            });
        });

        describe("GET /users", () => {
            it("should return an empty array when there are no users", async () => {
                const response = await request(app)
                    .get("/users")
                    .set("Cookie", [`accessToken=${adminToken}`]);

                expect(response.status).toBe(200);
                expect(response.body.data).toEqual([]);
            });

            it("should return every user", async () => {
                const userRepository = connection.getRepository(User);
                await userRepository.save({
                    firstName: "One",
                    lastName: "User",
                    email: "one@example.com",
                    password: await bcrypt.hash("Password1!", 10),
                    role: Roles.CUSTOMER,
                });
                await userRepository.save({
                    firstName: "Two",
                    lastName: "User",
                    email: "two@example.com",
                    password: await bcrypt.hash("Password1!", 10),
                    role: Roles.MANAGER,
                });

                const response = await request(app)
                    .get("/users")
                    .set("Cookie", [`accessToken=${adminToken}`]);

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveLength(2);

                const emails = (response.body.data as { email: string }[]).map(
                    (u) => u.email,
                );

                expect(emails.sort()).toEqual([
                    "one@example.com",
                    "two@example.com",
                ]);
            });
        });

        describe("GET /users/:id", () => {
            it("should return the user when the id exists", async () => {
                const userRepository = connection.getRepository(User);
                const saved = await userRepository.save({
                    firstName: "A",
                    lastName: "B",
                    email: "byid@example.com",
                    password: await bcrypt.hash("Password1!", 10),
                    role: Roles.CUSTOMER,
                });

                const response = await request(app)
                    .get(`/users/${saved.id}`)
                    .set("Cookie", [`accessToken=${adminToken}`]);

                expect(response.status).toBe(200);
                expect((response.body as { id: number }).id).toBe(saved.id);
                expect((response.body as { email: string }).email).toBe(
                    "byid@example.com",
                );
            });

            it("should return 400 when the user does not exist", async () => {
                const response = await request(app)
                    .get("/users/99999")
                    .set("Cookie", [`accessToken=${adminToken}`]);

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors?: { msg?: string }[] })
                        .errors?.[0]?.msg,
                ).toBe("User does not exist.");
            });

            it("should return 400 when id is not a number", async () => {
                const response = await request(app)
                    .get("/users/not-a-number")
                    .set("Cookie", [`accessToken=${adminToken}`]);

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors?: { msg?: string }[] })
                        .errors?.[0]?.msg,
                ).toBe("Invalid URL Param.");
            });
        });

        describe("PATCH /users/:id", () => {
            it("should update firstName, lastName, role, email & tenantId", async () => {
                const tenant = await createTenant(
                    connection.getRepository(Tenant),
                );
                const userRepository = connection.getRepository(User);
                const saved = await userRepository.save({
                    firstName: "Old",
                    lastName: "Name",
                    email: "update@example.com",
                    password: await bcrypt.hash("Password1!", 10),
                    role: Roles.MANAGER,
                });

                const response = await request(app)
                    .patch(`/users/${saved.id}`)
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send({
                        firstName: "New",
                        lastName: "Person",
                        role: Roles.MANAGER,
                        email: "update@example.com",
                        tenantId: tenant.id,
                    });

                expect(response.status).toBe(200);
                expect(response.body).toEqual({ id: saved.id });

                const row = await userRepository.findOne({
                    where: { id: saved.id },
                    relations: ["tenant"],
                });

                expect(row?.firstName).toBe("New");
                expect(row?.lastName).toBe("Person");
                expect(row?.role).toBe(Roles.MANAGER);
                expect(row?.email).toBe("update@example.com");
                expect(row?.tenant.id).toBe(tenant.id);
            });

            it("should return 400 when validation fails on update", async () => {
                const tenant = await createTenant(
                    connection.getRepository(Tenant),
                );
                const userRepository = connection.getRepository(User);
                const saved = await userRepository.save({
                    firstName: "Old",
                    lastName: "Name",
                    email: "validation-patch@example.com",
                    password: await bcrypt.hash("Password1!", 10),
                    role: Roles.MANAGER,
                });

                const response = await request(app)
                    .patch(`/users/${saved.id}`)
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send({
                        firstName: "",
                        lastName: "",
                        role: "",
                        email: "test@example.com",
                        tenantId: tenant.id,
                    });

                expect(response.status).toBe(400);
                expect(Array.isArray(response.body.errors)).toBe(true);
            });

            it("should return 400 when id is not a number", async () => {
                const tenant = await createTenant(
                    connection.getRepository(Tenant),
                );
                const response = await request(app)
                    .patch("/users/not-a-number")
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send({
                        firstName: "A",
                        lastName: "B",
                        role: Roles.CUSTOMER,
                        email: "test@example.com",
                        tenantId: tenant.id,
                    });

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors?: { msg?: string }[] })
                        .errors?.[0]?.msg,
                ).toBe("Invalid URL Param");
            });
        });

        describe("DELETE /users/:id", () => {
            it("should remove the user", async () => {
                const userRepository = connection.getRepository(User);
                const saved = await userRepository.save({
                    firstName: "Del",
                    lastName: "Me",
                    email: "del@example.com",
                    password: await bcrypt.hash("Password1!", 10),
                    role: Roles.CUSTOMER,
                });

                const response = await request(app)
                    .delete(`/users/${saved.id}`)
                    .set("Cookie", [`accessToken=${adminToken}`]);

                expect(response.status).toBe(200);
                expect(response.body).toEqual({ id: saved.id });

                const users = await userRepository.find();
                expect(users).toHaveLength(0);
            });

            it("should return 400 when id is not a number", async () => {
                const response = await request(app)
                    .delete("/users/not-a-number")
                    .set("Cookie", [`accessToken=${adminToken}`]);

                expect(response.status).toBe(400);
                expect(
                    (response.body as { errors?: { msg?: string }[] })
                        .errors?.[0]?.msg,
                ).toBe("Invalid URL Param.");
            });
        });
    });
});
