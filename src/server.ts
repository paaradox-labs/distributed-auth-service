import "reflect-metadata";
import app from "./app.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            {
                logger.info("Server listening on port", { port: PORT });
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        logger.info(`Click here to open http://localhost:${PORT}`);
        process.exit(1);
    }
};

startServer();
