import { expressjwt } from "express-jwt";
import { Config } from "../config/index.js";
import type { RequestHandler } from "express";
import type { Request } from "express";
import type { AuthCookie } from "../types/index.js";

const parseRefreshToken: RequestHandler = expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
});

export default parseRefreshToken;
