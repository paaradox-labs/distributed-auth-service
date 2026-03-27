import express from "express";
import type { Request, Response, NextFunction } from "express";
import { AuthController } from "../controller/AuthController.js";
import { UserService } from "../services/UserService.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import logger from "../config/logger.js";
import registerValidator from "../validators/register-validator.js";
import { Tokenservice } from "../services/TokenService.js";
import { RefreshToken } from "../entity/RefreshTokens.js";

const router: ReturnType<typeof express.Router> = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new Tokenservice(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
