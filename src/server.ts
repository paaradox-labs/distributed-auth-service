import app from "./app.js";
import { Config } from "./config/index.js";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            console.log(`Application running on port ${PORT}`);
        });
    } catch (error) {
        console.log(`Error: ${error}`);
        process.exit(1);
    }
};

startServer();
