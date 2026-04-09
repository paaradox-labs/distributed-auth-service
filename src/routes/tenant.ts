import express, { type NextFunction, type Response } from "express";
import { TenantController } from "../controller/TenantController.js";
import { TenantService } from "../services/TenantService.js";
import { AppDataSource } from "../config/data-source.js";
import { Tenant } from "../entity/Tenant.js";
import logger from "../config/logger.js";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { Roles } from "../constants/index.js";
import type { CreateTenantRequest } from "../types/index.js";
import tenantValidator from "../validators/tenant-validator.js";

const router: ReturnType<typeof express.Router> = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    "/",
    authenticate,
    tenantValidator,
    canAccess([Roles.ADMIN]),
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

router.patch(
    "/:id",
    authenticate,
    tenantValidator,
    canAccess([Roles.ADMIN]),
    (req: CreateTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next),
);

router.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req, res, next) => tenantController.destroy(req, res, next),
);

router.get("/", (req, res, next) => tenantController.getAll(req, res, next));

router.get("/:id", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.getOne(req, res, next),
);

export default router;
