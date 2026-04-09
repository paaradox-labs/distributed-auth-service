import { describe, expect, it } from "@jest/globals";
import type { Repository } from "typeorm";
import { UserService } from "../../src/services/UserService.js";
import { User } from "../../src/entity/User.js";
import { Roles } from "../../src/constants/index.js";
import { mockFn } from "../helpers/mock-fn.js";

describe("UserService error paths", () => {
    it("maps database save failures on create to a 500 http error", async () => {
        const userRepository = {
            findOne: mockFn().mockResolvedValue(null),
            save: mockFn().mockRejectedValue(new Error("constraint")),
        } as unknown as Repository<User>;

        const service = new UserService(userRepository);

        await expect(
            service.create({
                firstName: "A",
                lastName: "B",
                email: "a@b.com",
                password: "longpassword",
                role: Roles.CUSTOMER,
                tenantId: 1,
            }),
        ).rejects.toMatchObject({
            status: 500,
            message: "Failed to store data in database",
        });
    });

    it("maps database update failures to a 500 http error", async () => {
        const userRepository = {
            update: mockFn().mockRejectedValue(new Error("constraint")),
        } as unknown as Repository<User>;

        const service = new UserService(userRepository);

        await expect(
            service.update(1, {
                firstName: "A",
                lastName: "B",
                role: Roles.CUSTOMER,
            }),
        ).rejects.toMatchObject({
            status: 500,
            message: "Failed to update the user in the database",
        });
    });
});
