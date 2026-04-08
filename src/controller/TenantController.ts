import type { NextFunction, Response } from "express";
import type { TenantService } from "../services/TenantService.js";
import type { CreateTenantRequest } from "../types/index.js";
import type { Logger } from "winston";

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
}
