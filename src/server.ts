import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";
import { AppDataSource } from "./config/data-source.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

export async function startServer() {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");
        app.listen(PORT, () => {
            logger.info(
                `Server listening on port: ${PORT}. Click here to open http://localhost:${PORT}`,
            );
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
}

const thisFile = fileURLToPath(import.meta.url);
const isMainEntry =
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === path.resolve(thisFile);

if (isMainEntry) {
    void startServer();
}
