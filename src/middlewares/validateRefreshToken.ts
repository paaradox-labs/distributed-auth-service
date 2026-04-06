import { expressjwt } from "express-jwt";
import { Config } from "../config/index.js";
import type { RequestHandler } from "express";
import type { Request } from "express";
import type { AuthCookie } from "../types/index.js";
import { AppDataSource } from "../config/data-source.js";
import { RefreshToken } from "../entity/RefreshTokens.js";
import logger from "../config/logger.js";
import type { IRefreshTokenPayload } from "../types/index.js";

const validateRefreshToken: RequestHandler = expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        console.log("token", token);

        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: {
                        id: Number(token?.payload.sub),
                    },
                },
            });
            return refreshToken === null;
        } catch (err) {
            console.log(err);
            logger.error("Error while getting the refresh token", {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        return true;
    },
});

export default validateRefreshToken;
