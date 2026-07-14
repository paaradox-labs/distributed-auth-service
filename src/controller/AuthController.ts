import type { Request, Response, NextFunction } from "express";
import type { AuthRequest, RegisterUserRequest } from "../types/index.js";
import { UserService } from "../services/UserService.js";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import type { JwtPayload } from "jsonwebtoken";
import type { Tokenservice } from "../services/TokenService.js";
import createHttpError from "http-errors";
import type { CredentialService } from "../services/CredentialService.js";
import { Roles } from "../constants/index.js";
import type { User } from "../entity/User.js";
import { Config } from "../config/index.js";

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: Tokenservice,
        private readonly credentialService: CredentialService,
    ) {}

    /** Returns true when validation failed and a 400 response was sent. */
    private validationFailed(req: Request, res: Response): boolean {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({
                errors: result.array(),
            });
            return true;
        }
        return false;
    }

    private setAuthCookies(
        res: Response,
        accessToken: string,
        refreshToken: string,
    ) {
        res.cookie("accessToken", accessToken, {
            domain: Config.MAIN_DOMAIN,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 1, // 1d
            httpOnly: true, // Important
        });

        res.cookie("refreshToken", refreshToken, {
            domain: Config.MAIN_DOMAIN,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
            httpOnly: true, // Important
        });
    }

    private badCredentials(next: NextFunction) {
        next(createHttpError(400, "Email or password does not match"));
    }

    private async createSessionTokens(user: User) {
        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            tenant: user.tenant ? String(user.tenant?.id) : "",
        };

        const accessToken = this.tokenService.generateAccessToken(payload);

        const newRefreshToken =
            await this.tokenService.persistRefreshToken(user);

        const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: String(newRefreshToken.id),
        });

        return { accessToken, refreshToken };
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        if (this.validationFailed(req, res)) {
            return;
        }

        const { firstName, lastName, email, password, tenantId } = req.body;
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
                role: Roles.CUSTOMER,
                tenantId,
            });

            this.logger.info("User has been registered", { id: user.id });

            const { accessToken, refreshToken } =
                await this.createSessionTokens(user);
            this.setAuthCookies(res, accessToken, refreshToken);

            res.status(201).json(user);
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        if (this.validationFailed(req, res)) {
            return;
        }

        const { email, password } = req.body;

        this.logger.debug("New request to login a user", {
            email,
            password: "*****",
        });

        // Check if the username (email) exists in database
        // Compare password
        // Generate tokens
        // Add tokens to cookies
        // Return the response (id)
        try {
            const user = await this.userService.findByEmailWithPassword(email);

            if (!user) {
                this.badCredentials(next);
                return;
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                this.badCredentials(next);
                return;
            }

            const { accessToken, refreshToken } =
                await this.createSessionTokens(user);
            this.setAuthCookies(res, accessToken, refreshToken);

            this.logger.info("User has been logged in", {
                id: user.id,
                email: user.email,
            });

            res.status(200).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        // token req.auth.id
        const user = await this.userService.findById(Number(req.auth.sub));
        res.json({
            ...user,
            password: undefined,
        });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                next(
                    createHttpError(400, "User with the token could not find"),
                );
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
                tenant: user.tenant ? String(user.tenant?.id) : "",
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const { refreshToken } = await this.createSessionTokens(user);

            // Delete Old Refresh Token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            this.setAuthCookies(res, accessToken, refreshToken);

            this.logger.info("User has been logged in", {
                id: user.id,
            });

            res.json({
                id: user.id,
            });
        } catch (err) {
            next(err);
            return;
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });
            this.logger.info("User has been logged out.", {
                id: req.auth.sub,
            });
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.json({});
        } catch (error) {
            next(error);
            return;
        }
    }
}
