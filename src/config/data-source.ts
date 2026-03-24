import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User.js";
import { Config } from "./index.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: String(Config.DB_HOST),
    port: Number(Config.DB_PORT),
    username: String(Config.DB_USERNAME),
    password: String(Config.DB_PASSWORD),
    database: String(Config.DB_NAME),

    // Don't use this in production
    synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev",
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
