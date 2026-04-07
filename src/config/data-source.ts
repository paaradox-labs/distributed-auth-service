import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./index.js";

const isTest = Config.NODE_ENV === "test";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: String(Config.DB_HOST),
    port: Number(Config.DB_PORT),
    username: String(Config.DB_USERNAME),
    password: String(Config.DB_PASSWORD),
    database: String(Config.DB_NAME),

    // Don't use this in production. Always keep false.
    // synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev",
    synchronize: false,
    logging: false,
    entities: ["src/entity/*.ts"],
    migrations: isTest ? [] : ["src/migrations/*.ts"],
    subscribers: [],
});
