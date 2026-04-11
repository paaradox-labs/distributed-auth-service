import type { DataSourceOptions } from "typeorm";
import { User } from "../entity/User.js";
import { RefreshToken } from "../entity/RefreshTokens.js";
import { Tenant } from "../entity/Tenant.js";

/** Postgres branch of DataSourceOptions — avoids union members (e.g. SQLite) that omit `host`. */
export type PostgresDataSourceOptions = Extract<
    DataSourceOptions,
    { type: "postgres" }
>;

export type DbConfigFields = {
    host: string | undefined;
    port: string | undefined;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    /** Passed to node-postgres when the server requires TLS (e.g. Neon, Supabase, RDS). */
    ssl?: PostgresDataSourceOptions["ssl"];
};

export function buildDataSourceOptions(
    omitMigrations: boolean,
    db: DbConfigFields,
    entityClasses: [typeof User, typeof RefreshToken, typeof Tenant],
): PostgresDataSourceOptions {
    return {
        type: "postgres",
        host: String(db.host),
        port: Number(db.port),
        username: String(db.username),
        password: String(db.password),
        database: String(db.database),
        ...(db.ssl === undefined ? {} : { ssl: db.ssl }),

        synchronize: false,
        logging: false,
        entities: entityClasses,
        migrations: omitMigrations ? [] : ["src/migration/*.{ts,js}"],
        subscribers: [],
    };
}
