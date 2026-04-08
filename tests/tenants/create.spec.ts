import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import app from "../../src/app.js";
import request from "supertest";
import { Tenant } from "../../src/entity/Tenant.js";
// import type { JWKSMock } from "mock-jwks";
// import { getCreateJWKSMock } from "../shims/mock-jwks.js";

describe("POST /tenants", () => {
    let connection: DataSource;
    // let jwks: JWKSMock;

    beforeAll(async () => {
        // const createJWKSMock = getCreateJWKSMock();
        // jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        // jwks.start();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    afterEach(() => {
        // jwks.stop();
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
            await request(app).post("/tenants").send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            // Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0]?.name).toBe(tenantData.name);
            expect(tenants[0]?.address).toBe(tenantData.address);
        });
    });
});
