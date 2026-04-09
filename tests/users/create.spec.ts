import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import type { JWKSMock } from "mock-jwks";
import { getCreateJWKSMock } from "../shims/mock-jwks.js";
import { Roles } from "../../src/constants/index.js";
import { User } from "../../src/entity/User.js";
import { createTenant } from "../utils/index.js";
import { Tenant } from "../../src/entity/Tenant.js";

describe("Create routes", () => {
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

    describe("POST /users", () => {
        describe("Given all fields", () => {
            it("should persist the user in the database", async () => {
                const tenant = await createTenant(
                    connection.getRepository(Tenant),
                );
                const adminToken = jwks.token({
                    sub: "1",
                    role: Roles.ADMIN,
                });

                const userData = {
                    firstName: "Aditya",
                    lastName: "Vyas",
                    email: "avyas8927@gmail.com",
                    password: "Aditya123",
                    tenantId: tenant.id,
                    role: Roles.MANAGER,
                };

                // Add token to cookie
                await request(app)
                    .post("/users")
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send(userData);

                // Assert
                const userRepository = connection.getRepository(User);
                const users = await userRepository.find();

                // Check if user id matches with the registerd user.
                expect(users).toHaveLength(1);
                expect(users[0]?.email).toBe(userData.email);
            });

            it("should create a manager user", async () => {
                const tenant = await createTenant(
                    connection.getRepository(Tenant),
                );

                const adminToken = jwks.token({
                    sub: "1",
                    role: Roles.ADMIN,
                });

                const userData = {
                    firstName: "Aditya",
                    lastName: "Vyas",
                    email: "avyas8927@gmail.com",
                    password: "Aditya123",
                    tenantId: tenant.id,
                };

                // Add token to cookie
                await request(app)
                    .post("/users")
                    .set("Cookie", [`accessToken=${adminToken}`])
                    .send(userData);

                // Assert
                const userRepository = connection.getRepository(User);
                const users = await userRepository.find();

                // Check if user id matches with the registerd user.
                expect(users).toHaveLength(1);
                expect(users[0]?.role).toBe(Roles.MANAGER);
            });

            it("should return 403 if non admin user tries to create a user", async () => {
                const tenant = await createTenant(
                    connection.getRepository(Tenant),
                );

                const managerToken = jwks.token({
                    sub: "1",
                    role: Roles.MANAGER,
                });

                const userData = {
                    firstName: "Aditya",
                    lastName: "Vyas",
                    email: "avyas8927@gmail.com",
                    password: "Aditya123",
                    tenantId: tenant.id,
                };

                const response = await request(app)
                    .post("/users")
                    .set("Cookie", [`accessToken=${managerToken}`])
                    .send(userData);

                expect(response.status).toBe(403);

                const userRepository = connection.getRepository(User);
                const users = await userRepository.find();

                expect(users).toHaveLength(0);
            });
        });
    });
});
