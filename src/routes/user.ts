import express, { type NextFunction, type Response } from "express";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { Roles } from "../constants/index.js";
import type { CreateUserRequest } from "../types/index.js";
import tenantValidator from "../validators/tenant-validator.js";
import { UserController } from "../controller/UserController.js";
import { UserService } from "../services/UserService.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";

const router: ReturnType<typeof express.Router> = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post(
    "/",
    authenticate,
    tenantValidator,
    canAccess([Roles.ADMIN]),
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

export default router;
