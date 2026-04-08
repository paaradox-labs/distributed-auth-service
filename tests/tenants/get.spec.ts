import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import { Tenant } from "../../src/entity/Tenant.js";

describe("GET /tenants and GET /tenants/:id", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("GET /tenants", () => {
        it("should return 200 and an empty array when no tenants exist", async () => {
            const response = await request(app).get("/tenants").send();

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        it("should return 200 and all tenants when rows exist", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save({
                name: "Acme Corp",
                address: "1 Main St",
            });

            const response = await request(app).get("/tenants").send();

            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                name: "Acme Corp",
                address: "1 Main St",
            });
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
                .send();

            expect(response.statusCode).toBe(400);
        });

        it("should return 404 when tenant does not exist", async () => {
            const response = await request(app).get("/tenants/99999").send();

            expect(response.statusCode).toBe(404);
        });
    });
});
