import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import { Tenant } from "../../src/entity/Tenant.js";
import type { JWKSMock } from "mock-jwks";
import { getCreateJWKSMock } from "../shims/mock-jwks.js";
import { Roles } from "../../src/constants/index.js";

describe("PATCH /tenants/:id", () => {
    let connection: DataSource;
    let jwks: JWKSMock;
    let adminToken: string;

    beforeAll(async () => {
        const createJWKSMock = getCreateJWKSMock();
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
        jwks.start();
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
        jwks.stop();
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return 200 and update the tenant in the database", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            const saved = await tenantRepository.save({
                name: "Old name",
                address: "Old address",
            });

            const payload = {
                name: "New name",
                address: "New address",
            };

            const response = await request(app)
                .patch(`/tenants/${saved.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(payload);

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ id: saved.id });

            const updated = await tenantRepository.findOne({
                where: { id: saved.id },
            });
            expect(updated?.name).toBe(payload.name);
            expect(updated?.address).toBe(payload.address);
        });

        it("should return 401 if user is not authenticated and tries to update a tenant", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            const saved = await tenantRepository.save({
                name: "Old name",
                address: "Old address",
            });

            const response = await request(app)
                .patch(`/tenants/${saved.id}`)
                .send({ name: "N", address: "A" });

            expect(response.statusCode).toBe(401);
        });

        it("should return 403 if user is not an admin and tries to update a tenant", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            const saved = await tenantRepository.save({
                name: "Old name",
                address: "Old address",
            });

            const managerToken = jwks.token({
                sub: "1",
                role: Roles.MANAGER,
            });

            const response = await request(app)
                .patch(`/tenants/${saved.id}`)
                .set("Cookie", [`accessToken=${managerToken}`])
                .send({ name: "N", address: "A" });

            expect(response.statusCode).toBe(403);
        });

        it("should return 400 when id param is not a number", async () => {
            const response = await request(app)
                .patch("/tenants/not-a-number")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({ name: "N", address: "A" });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 if name is empty", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            const saved = await tenantRepository.save({
                name: "Old name",
                address: "Old address",
            });

            const response = await request(app)
                .patch(`/tenants/${saved.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({ name: "", address: "Valid address" });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 if address is empty", async () => {
            const tenantRepository = connection.getRepository(Tenant);
            const saved = await tenantRepository.save({
                name: "Old name",
                address: "Old address",
            });

            const response = await request(app)
                .patch(`/tenants/${saved.id}`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({ name: "Valid name", address: "" });

            expect(response.statusCode).toBe(400);
        });
    });
});
