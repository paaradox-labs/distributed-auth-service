import "reflect-metadata";

import express, {
    type Express,
    type NextFunction,
    type Request,
    type Response,
} from "express";

import logger from "./config/logger.js";
import { httpErrorStatus } from "./utils/httpErrorStatus.js";

import type { HttpError } from "http-errors";

import authRouter from "./routes/auth.js";
import tenantRouter from "./routes/tenant.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";

const app: Express = express();
app.disable("x-powered-by");
app.use(
    express.static("public", {
        dotfiles: "allow",
    }),
);
app.use(cookieParser());
app.use(express.json());

app.get("/", async (req, res) => {
    res.status(200).send("Welcome to Authentication Page");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

//global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = httpErrorStatus(err);

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
