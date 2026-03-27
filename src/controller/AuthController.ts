import fs from "fs";
import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index.js";
import { UserService } from "../services/UserService.js";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import path from "path";
import { dirname } from "path";
import createHttpError from "http-errors";
import { fileURLToPath } from "url";
import { Config } from "../config/index.js";
import { AppDataSource } from "../config/data-source.js";
import { RefreshToken } from "../entity/RefreshTokens.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            });
        }

        const { firstName, lastName, email, password } = req.body;
        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            email,
            password: "*****",
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("User has been registered", { id: user.id });

            let privateKey: Buffer;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, "../../certs/private.pem"),
                );
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                const error = createHttpError(
                    500,
                    "Error while reading private key",
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = jwt.sign(payload, privateKey, {
                algorithm: "RS256",
                expiresIn: "1h",
                issuer: "auth-service",
            });

            // Persist the refresh token
            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });

            const refreshToken = jwt.sign(
                payload,
                Config.REFRESH_TOKEN_SECRET!,
                {
                    algorithm: "HS256",
                    expiresIn: "1y",
                    issuer: "auth-service",
                    jwtid: String(newRefreshToken.id),
                },
            );

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true, // Important
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true, // Important
            });

            res.status(201).json(user);
        } catch (error) {
            next(error);
            return;
        }
    }
}
