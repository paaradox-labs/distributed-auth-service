import type { Request, NextFunction, Response } from "express";
import type { UserService } from "../services/UserService.js";
import type {
    CreateUserRequest,
    UpdateUserRequest,
    UserQueryParams,
} from "../types/index.js";
import { matchedData, validationResult } from "express-validator";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        // Validate
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        const { firstName, lastName, email, password, tenantId, role } =
            req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        // Validate
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            });
        }

        const { firstName, lastName, role, email, tenantId } = req.body;
        const userId = req.params.id;

        if (Number.isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid URL Param"));
            return;
        }

        this.logger.debug("Requesting for updating a user", req.body);

        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
                email,
                tenantId,
            });
            this.logger.info("User has been updated", {
                id: userId,
            });
            res.json({
                id: Number(userId),
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [users, count] = await this.userService.getAll(
                validatedQuery as UserQueryParams,
            );
            this.logger.info("All users have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (Number.isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid URL Param."));
            return;
        }

        try {
            const user = await this.userService.findById(Number(userId));

            if (!user) {
                next(createHttpError(400, "User does not exist."));
                return;
            }
            this.logger.info("User has been fetched", {
                id: user.id,
            });
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (Number.isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid URL Param."));
            return;
        }

        try {
            await this.userService.deleteById(Number(userId));
            this.logger.info("User has been deleted", {
                id: Number(userId),
            });
            res.json({
                id: Number(userId),
            });
        } catch (error) {
            next(error);
        }
    }
}
