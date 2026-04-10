import { buildDataSourceOptions } from "../../src/config/data-source-options.js";
import { User } from "../../src/entity/User.js";
import { RefreshToken } from "../../src/entity/RefreshTokens.js";
import { Tenant } from "../../src/entity/Tenant.js";

const entityClasses = [User, RefreshToken, Tenant] as [
    typeof User,
    typeof RefreshToken,
    typeof Tenant,
];

const db = {
    host: "localhost",
    port: "5432",
    username: "u",
    password: "p",
    database: "db",
};

describe("buildDataSourceOptions", () => {
    it("uses entity classes and empty migrations when omitMigrations is true (Jest)", () => {
        const opts = buildDataSourceOptions(true, db, entityClasses);

        expect(opts.type).toBe("postgres");
        expect(opts.host).toBe("localhost");
        expect(opts.port).toBe(5432);
        expect(opts.username).toBe("u");
        expect(opts.password).toBe("p");
        expect(opts.database).toBe("db");
        expect(opts.synchronize).toBe(false);
        expect(opts.logging).toBe(false);
        expect(opts.entities).toEqual(entityClasses);
        expect(opts.migrations).toEqual([]);
        expect(opts.subscribers).toEqual([]);
    });

    it("uses entity classes and migration globs when omitMigrations is false (e.g. dev)", () => {
        const opts = buildDataSourceOptions(false, db, entityClasses);

        expect(opts.entities).toEqual(entityClasses);
        expect(opts.migrations).toEqual(["src/migration/*.{ts,js}"]);
    });

    it("passes ssl through to TypeORM when set (e.g. CI against hosted Postgres)", () => {
        const ssl = { rejectUnauthorized: false };
        const opts = buildDataSourceOptions(
            true,
            { ...db, ssl },
            entityClasses,
        );

        expect(opts.ssl).toEqual(ssl);
    });
});
