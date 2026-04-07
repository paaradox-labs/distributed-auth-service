import express from "express";
import type { Request, Response, NextFunction } from "express";

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

router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

router.post(
    "/login",
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);

router.get("/self", authenticate, (req: Request, res: Response) =>
    authController.self(req as AuthRequest, res),
);

router.post(
    "/refresh",
    validateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(req as AuthRequest, res, next),
);

router.post(
    "/logout",
    authenticate,
    parseRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req as AuthRequest, res, next),
);

export default router;
