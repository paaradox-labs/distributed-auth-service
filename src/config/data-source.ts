import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./index.js";
import { User } from "../entity/User.js";
import { RefreshToken } from "../entity/RefreshTokens.js";
import { Tenant } from "../entity/Tenant.js";
import { buildDataSourceOptions } from "./data-source-options.js";

const omitMigrations = Config.NODE_ENV === "test";

// Don't use this in production. Always keep false.
// synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev",

export const AppDataSource = new DataSource(
    buildDataSourceOptions(
        omitMigrations,
        {
            host: Config.DB_HOST,
            port: Config.DB_PORT,
            username: Config.DB_USERNAME,
            password: Config.DB_PASSWORD,
            database: Config.DB_NAME,
            ssl: Config.POSTGRES_SSL,
        },
        [User, RefreshToken, Tenant],
    ),
);
