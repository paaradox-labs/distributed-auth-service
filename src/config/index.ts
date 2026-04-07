import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST: DB_HOST,
    DB_PORT: DB_PORT,
    DB_USERNAME: DB_USERNAME,
    DB_PASSWORD: DB_PASSWORD,
    DB_NAME: DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
};
