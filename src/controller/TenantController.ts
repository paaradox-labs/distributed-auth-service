import type { Request, NextFunction, Response } from "express";
import type { TenantService } from "../services/TenantService.js";
import type { CreateTenantRequest } from "../types/index.js";
import createHttpError from "http-errors";
import type { Logger } from "winston";
import { validationResult } from "express-validator";

export class TenantController {
    constructor(
        private readonly tenantService: TenantService,
        private readonly logger: Logger,
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            });
        }

        const { name, address } = req.body;

        this.logger.debug("Request for creating a tenant", req.body);

        try {
            const tenant = await this.tenantService.create({ name, address });

            this.logger.info("Tenant has been created", {
                id: tenant.id,
            });

            res.status(201).json({
                id: tenant.id,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            this.logger.info("All tennat has been fetched");
            res.json(tenants);
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (Number.isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid URL Params"));
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));
            if (!tenant) {
                next(createHttpError(404, "Tenant does not exist"));
                return;
            }
            this.logger.info("Tenant has been fetched");
            res.json(tenant);
        } catch (error) {
            next(error);
        }
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            });
        }

        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (Number.isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }

        this.logger.debug("Request for updating a tenant", req.body);

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            this.logger.info("Tenant has been updated", { id: tenantId });
            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (Number.isNaN(Number(tenantId))) {
            next(createHttpError(400, "Invalid url param."));
            return;
        }

        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info("Tenant has been deleted", {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
        }
    }
}
