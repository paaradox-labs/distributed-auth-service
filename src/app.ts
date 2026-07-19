import "reflect-metadata";

import express, { type Express } from "express";

import authRouter from "./routes/auth.js";
import tenantRouter from "./routes/tenant.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";
import { Config } from "./config/index.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import cors from "cors";

const app: Express = express();
const ALLOWED_DOMAINS = [Config.CLIENT_UI_DOMAIN, Config.ADMIN_UI_DOMAIN];

app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
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
    res.status(200).send("Welcome to Authentication Page from K8s");
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

//global error handler
app.use(globalErrorHandler);

export default app;
