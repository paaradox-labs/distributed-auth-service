import express, {
    type Response,
    type NextFunction,
    type RequestHandler,
} from "express";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { Roles } from "../constants/index.js";
import type { CreateUserRequest, UpdateUserRequest } from "../types/index.js";
import { UserController } from "../controller/UserController.js";
import { UserService } from "../services/UserService.js";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";
import logger from "../config/logger.js";
import updateUserValidator from "../validators/update-user-validator.js";
import createUserValidator from "../validators/create-user-validator.js";
import listUserValidator from "../validators/list-user-validator.js";
import { type Request } from "express-jwt";

const router: ReturnType<typeof express.Router> = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    authenticate as RequestHandler,
    createUserValidator,
    canAccess([Roles.ADMIN]),
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);

router.get(
    "/",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    listUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
);

router.get(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) => userController.getOne(req, res, next),
);
router.patch(
    "/:id",
    authenticate as RequestHandler,
    updateUserValidator,
    canAccess([Roles.ADMIN]),
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
);
router.delete(
    "/:id",
    authenticate as RequestHandler,
    canAccess([Roles.ADMIN]),
    (req, res, next) => userController.destroy(req, res, next),
);

export default router;
