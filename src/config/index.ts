import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { resolveEnvFilePath } from "./env-file-path.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({
    path: resolveEnvFilePath(process.env.NODE_ENV, __dirname),
});

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
    PGSSLMODE,
    DB_SSL_REJECT_UNAUTHORIZED,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY,
} = process.env;

/** Enables TLS for Postgres when the server rejects non-SSL connections (common for hosted DBs in CI). */
function resolvePostgresSsl(): undefined | { rejectUnauthorized: boolean } {
    const raw = DB_SSL ?? PGSSLMODE;
    if (raw === undefined || raw === "") {
        return undefined;
    }
    const v = raw.toLowerCase();
    if (v === "true" || v === "1" || v === "require") {
        return {
            rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED === "true",
        };
    }
    return undefined;
}

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST: DB_HOST,
    DB_PORT: DB_PORT,
    DB_USERNAME: DB_USERNAME,
    DB_PASSWORD: DB_PASSWORD,
    DB_NAME: DB_NAME,
    POSTGRES_SSL: resolvePostgresSsl(),
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY,
};
