import "reflect-metadata";

import express, { type Express } from "express";

import cors from "cors";

import authRouter from "./routes/auth.js";
import tenantRouter from "./routes/tenant.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";
import { Config } from "./config/index.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";

const app: Express = express();
app.use(
    cors({
        origin: [Config.FRONTEND_URL!],
        credentials: true,
    }),
);
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
app.use(globalErrorHandler);

export default app;
