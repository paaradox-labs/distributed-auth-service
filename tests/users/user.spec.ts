import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
// import bcrypt from "bcrypt";
// import { User } from "../../src/entity/User.js";
// import { Roles } from "../../src/constants/index.js";
import request from "supertest";
import app from "../../src/app.js";
// import { isJWT } from "../utils/index.js";
// import { response } from "express";

describe("GET /auth/self", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database Truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe("Given all fields", () => {
        it("should return the 200 status code", async () => {
            const response = await request(app).get("/auth/self").send();
            expect(response.statusCode).toBe(200);
        });
    });
});
