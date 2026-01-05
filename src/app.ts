import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import logger from "./config/logger.js";
import type { HttpError } from "http-errors";
// import createHttpError from "http-errors";

const app = express();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get("/", async (req, res, next) => {
    // const error = createHttpError(401, "This route is not accessible");
    // next(error);
    res.status(200).send("Welcome to Authentication Page");
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
