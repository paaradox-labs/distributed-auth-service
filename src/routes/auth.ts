import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";

import { AuthController } from "../controller/AuthController.js";

import { UserService } from "../services/UserService.js";
import { Tokenservice } from "../services/TokenService.js";

import { AppDataSource } from "../config/data-source.js";
import logger from "../config/logger.js";

import { User } from "../entity/User.js";
import { RefreshToken } from "../entity/RefreshTokens.js";

import registerValidator from "../validators/register-validator.js";
import loginValidator from "../validators/login-validator.js";
import { CredentialService } from "../services/CredentialService.js";
import authenticate from "../middlewares/authenticate.js";
import type { AuthRequest } from "../types/index.js";
import validateRefreshToken from "../middlewares/validateRefreshToken.js";
import parseRefreshToken from "../middlewares/parseRefreshToken.js";

const router: ReturnType<typeof express.Router> = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new Tokenservice(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

router.post("/register", registerValidator, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.register(req, res, next);
}) as RequestHandler);

router.post("/login", loginValidator, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.login(req, res, next);
}) as RequestHandler);

router.get("/self", authenticate, (async (req: Request, res: Response) => {
    await authController.self(req as AuthRequest, res);
}) as RequestHandler);

router.post("/refresh", validateRefreshToken, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.refresh(req as AuthRequest, res, next);
}) as RequestHandler);

router.post("/logout", authenticate, parseRefreshToken, (async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    await authController.logout(req as AuthRequest, res, next);
}) as RequestHandler);

export default router;
