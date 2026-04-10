import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import { Tenant } from "../../src/entity/Tenant.js";
import type { JWKSMock } from "mock-jwks";
import { getCreateJWKSMock } from "../shims/mock-jwks.js";
import { Roles } from "../../src/constants/index.js";

describe("POST /tenants", () => {
    let connection: DataSource;
    let jwks: JWKSMock;
    let adminToken: string;

    beforeAll(async () => {
        const createJWKSMock = getCreateJWKSMock();
        jwks = createJWKSMock("http://localhost:5501");
        jwks.start();
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();

        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        jwks?.stop();
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return a 201 status code", async () => {
            // Arrange
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            // Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it("should create a tenant in the database", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            // Act
            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0]?.name).toBe(tenantData.name);
            expect(tenants[0]?.address).toBe(tenantData.address);
        });

        it("should return 401 if user is not autheticated", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            // Act
            const response = await request(app)
                .post("/tenants")
                .send(tenantData);

            expect(response.statusCode).toBe(401);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(tenants).toHaveLength(0);
        });

        it("should return 403 if user is not an admin", async () => {
            // Arrange
            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            // Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken}`])
                .send(tenantData);

            // Assert
            expect(response.statusCode).toBe(403);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
        });

        it("should return the id of the created tenant", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "Tenant address",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty("id");
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 status code if name is missing", async () => {
            const tenantData = {
                name: "",
                address: "Tenant address",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(400);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0);
        });

        it("should return 400 status code if address is missing", async () => {
            const tenantData = {
                name: "Tenant name",
                address: "",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(400);
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0);
        });

        it("should return an array of validation errors when fields are invalid", async () => {
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({ name: "", address: "" });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("errors");
            expect(
                (response.body as { errors: unknown[] }).errors.length,
            ).toBeGreaterThan(0);
        });
    });
});
