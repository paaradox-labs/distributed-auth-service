import createHttpError from "http-errors";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Config } from "../config/index.js";
import { RefreshToken } from "../entity/RefreshTokens.js";
import { User } from "../entity/User.js";
import type { Repository } from "typeorm";
import fs from "node:fs";
import path from "node:path";

export class Tokenservice {
    constructor(
        private readonly refreshTokenRepostory: Repository<RefreshToken>,
    ) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pm"),
            );
        } catch {
            const error = createHttpError(
                500,
                "Error while reading the private key",
            );
            throw error;
        }

        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1d",
            issuer: "auth-service",
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y
        const newRefreshToken = await this.refreshTokenRepostory.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });
        return newRefreshToken;
    }

    async deleteRefreshToken(tokenId: number) {
        return this.refreshTokenRepostory.delete({
            id: tokenId,
        });
    }
}
