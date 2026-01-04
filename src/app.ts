import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import logger from "./config/logger.js";
import type { HttpError } from "http-errors";
import createHttpError from "http-errors";

const app = express();

app.get("/", async (req, res, next) => {
    const error = createHttpError(401, "This route is not accessible");
    next(error);
    // res.send("Welcome to Auth Service");
});

//global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
