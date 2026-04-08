import type { Request, NextFunction, Response } from "express";
import type { TenantService } from "../services/TenantService.js";
import type { CreateTenantRequest } from "../types/index.js";
import type { Logger } from "winston";
import createHttpError from "http-errors";

export class TenantController {
    constructor(
        private tenatService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;

        this.logger.debug("Request for creating a tenant", req.body);

        try {
            const tenant = await this.tenatService.create({ name, address });

            this.logger.info("Tenant has been created", {
                id: tenant.id,
            });

            res.status(201).json({
                id: tenant.id,
            });
        } catch (error) {
            next(error);
        }

        res.status(201).json({});
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenatService.getAll();
            this.logger.info("All tennat has been fetched");
            res.json(tenants);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid URL Params"));
            return;
        }

        try {
            const tenant = await this.tenatService.getById(Number(tenantId));
            if (!tenantId) {
                next(createHttpError(400, "Tenant does not exist"));
                return;
            }
            this.logger.info("Tenant has been fetched");
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }
}
