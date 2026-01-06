import path from "path";
import { config } from "dotenv";
config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } =
    process.env;

export const Config = {
    PORT: PORT || "5501",
    NODE_ENV: NODE_ENV || "development",
    DB_HOST: DB_HOST || "localhost",
    DB_PORT: DB_PORT || "5432",
    DB_USERNAME: DB_USERNAME || "root",
    DB_PASSWORD: DB_PASSWORD || "root",
    DB_NAME: DB_NAME || "auth_db",
};
