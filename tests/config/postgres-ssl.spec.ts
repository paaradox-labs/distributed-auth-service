import { describe, expect, it } from "@jest/globals";
import { resolvePostgresSsl } from "../../src/config/index.js";

describe("resolvePostgresSsl", () => {
    it("returns undefined when both inputs are undefined", () => {
        expect(
            resolvePostgresSsl(undefined, undefined, undefined),
        ).toBeUndefined();
    });

    it("returns undefined when the effective value is an empty string", () => {
        expect(resolvePostgresSsl("", undefined, undefined)).toBeUndefined();
        expect(resolvePostgresSsl(undefined, "", undefined)).toBeUndefined();
    });

    it("prefers DB_SSL over PGSSLMODE when both are set", () => {
        expect(resolvePostgresSsl("true", "false", undefined)).toEqual({
            rejectUnauthorized: false,
        });
    });

    it("uses PGSSLMODE when DB_SSL is undefined", () => {
        expect(resolvePostgresSsl(undefined, "require", "true")).toEqual({
            rejectUnauthorized: true,
        });
    });

    it.each([
        ["true", false],
        ["1", false],
        ["require", false],
        ["TRUE", false],
    ] as const)(
        "enables SSL for %s and maps rejectUnauthorized from env",
        (raw, rejectUnauthorized) => {
            expect(resolvePostgresSsl(raw, undefined, undefined)).toEqual({
                rejectUnauthorized,
            });
            expect(resolvePostgresSsl(undefined, raw, "true")).toEqual({
                rejectUnauthorized: true,
            });
        },
    );

    it("returns undefined for other string values", () => {
        expect(
            resolvePostgresSsl("false", undefined, undefined),
        ).toBeUndefined();
        expect(
            resolvePostgresSsl("maybe", undefined, undefined),
        ).toBeUndefined();
    });
});
