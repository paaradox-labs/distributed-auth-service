import app from "./app.js";
import { AppDataSource } from "./config/data-source.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");
        app.listen(PORT, () => {
            {
                logger.info(
                    `Server listening on port: ${PORT}. Click here to open http://localhost:${PORT}`,
                );
            }
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
};

startServer();
