import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index.js";
import { UserService } from "../services/UserService.js";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import type { JwtPayload } from "jsonwebtoken";
import type { Tokenservice } from "../services/TokenService.js";
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: Tokenservice,
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = await this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

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
