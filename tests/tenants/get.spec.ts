import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import { Tenant } from "../../src/entity/Tenant.js";
import type { JWKSMock } from "mock-jwks";
import { getCreateJWKSMock } from "../shims/mock-jwks.js";
import { Roles } from "../../src/constants/index.js";

describe("GET /tenants and GET /tenants/:id", () => {
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

    describe("GET /tenants", () => {
        it("should return 200 and an empty array when no tenants exist", async () => {
            const response = await request(app).get("/tenants").send();

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toEqual([]);
        });

        it("should return 200 and all tenants when rows exist", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save({
                name: "Acme Corp",
                address: "1 Main St",
            });

            const response = await request(app).get("/tenants").send();

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0]).toMatchObject({
                name: "Acme Corp",
                address: "1 Main St",
            });
        });

        it("should filter tenants by search query", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save({
                name: "Acme Corp",
                address: "1 Main St",
            });
            await tenantRepository.save({
                name: "Beta Inc",
                address: "2 Oak Ave",
            });

            const response = await request(app)
                .get("/tenants")
                .query({ q: "Acme" })
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].name).toBe("Acme Corp");
        });

        it("should use default pagination when currentPage and perPage are not provided", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save({
                name: "Tenant One",
                address: "Addr 1",
            });

            const response = await request(app).get("/tenants").send();

            expect(response.statusCode).toBe(200);
            expect(response.body.currentPage).toBe(1);
            expect(response.body.perPage).toBe(6);
        });

        it("should handle empty search query", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save({
                name: "Acme Corp",
                address: "1 Main St",
            });
            await tenantRepository.save({
                name: "Beta Inc",
                address: "2 Oak Ave",
            });

            const response = await request(app)
                .get("/tenants")
                .query({ q: "" })
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(2);
        });

        it("should accept explicit pagination params", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            for (let i = 1; i <= 5; i++) {
                await tenantRepository.save({
                    name: `Tenant ${i}`,
                    address: `Addr ${i}`,
                });
            }

            const response = await request(app)
                .get("/tenants")
                .query({ currentPage: "1", perPage: "2" })
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.currentPage).toBe(1);
            expect(response.body.perPage).toBe(2);
        });
    });

    describe("GET /tenants/:id", () => {
        it("should return 200 and the tenant when it exists", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            const saved = await tenantRepository.save({
                name: "Acme Corp",
                address: "1 Main St",
            });

            const response = await request(app)
                .get(`/tenants/${saved.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject({
                id: saved.id,
                name: "Acme Corp",
                address: "1 Main St",
            });
        });

        it("should return 400 when id is not a number", async () => {
            const response = await request(app)
                .get("/tenants/not-a-number")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.statusCode).toBe(400);
        });

        it("should return 404 when tenant does not exist", async () => {
            const response = await request(app)
                .get("/tenants/99999")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send();

            expect(response.statusCode).toBe(404);
        });
    });
});
