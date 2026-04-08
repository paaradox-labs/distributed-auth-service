import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import { Tenant } from "../../src/entity/Tenant.js";
import type { JWKSMock } from "mock-jwks";
import { getCreateJWKSMock } from "../shims/mock-jwks.js";
import { Roles } from "../../src/constants/index.js";

describe("DELETE /tenants/:id", () => {
    let connection: DataSource;
    let jwks: JWKSMock;
    let adminToken: string;

    beforeAll(async () => {
        const createJWKSMock = getCreateJWKSMock();
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        jwks.start();

        adminToken = jwks.token({
            sub: "1",
            role: Roles.ADMIN,
        });
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    afterEach(() => {
        jwks.stop();
    });

    it("should return 200 and remove the tenant from the database", async () => {
        const tenantRepository = connection.getRepository(Tenant);
        const saved = await tenantRepository.save({
            name: "To delete",
            address: "Somewhere",
        });

        const response = await request(app)
            .delete(`/tenants/${saved.id}`)
            .set("Cookie", [`accessToken=${adminToken}`])
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ id: saved.id });

        const remaining = await tenantRepository.find();
        expect(remaining).toHaveLength(0);
    });

    it("should return 401 if user is not authenticated while deleting a tenant", async () => {
        const tenantRepository = connection.getRepository(Tenant);
        const saved = await tenantRepository.save({
            name: "To delete",
            address: "Somewhere",
        });

        const response = await request(app)
            .delete(`/tenants/${saved.id}`)
            .send();

        expect(response.statusCode).toBe(401);
        const remaining = await tenantRepository.find();
        expect(remaining).toHaveLength(1);
    });

    it("should return 403 if user is not an admin while deleting a tenant", async () => {
        const tenantRepository = connection.getRepository(Tenant);
        const saved = await tenantRepository.save({
            name: "To delete",
            address: "Somewhere",
        });

        const managerToken = jwks.token({
            sub: "1",
            role: Roles.MANAGER,
        });

        const response = await request(app)
            .delete(`/tenants/${saved.id}`)
            .set("Cookie", [`accessToken=${managerToken}`])
            .send();

        expect(response.statusCode).toBe(403);
        const remaining = await tenantRepository.find();
        expect(remaining).toHaveLength(1);
    });

    it("should return 400 when id param is not a number", async () => {
        const response = await request(app)
            .delete("/tenants/not-a-number")
            .set("Cookie", [`accessToken=${adminToken}`])
            .send();

        expect(response.statusCode).toBe(400);
    });
});
