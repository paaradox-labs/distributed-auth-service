import app from "../src/app.js";
import request from "supertest";

describe("app", () => {
    it("GET / returns 200 and welcome text", async () => {
        const response = await request(app).get("/").send();

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Welcome to Authentication Page");
    });
});
