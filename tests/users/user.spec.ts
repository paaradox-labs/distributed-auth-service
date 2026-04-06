import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import { User } from "../../src/entity/User.js";
import { Roles } from "../../src/constants/index.js";
import type { JWKSMock } from "mock-jwks";
import { getCreateJWKSMock } from "../shims/mock-jwks.js";

describe("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: JWKSMock;

    beforeAll(async () => {
        const createJWKSMock = getCreateJWKSMock();
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        // Database Truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

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
            expect((response.body as Record<string, string>).id).toBe(data.id);
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
            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );
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
    });
});
