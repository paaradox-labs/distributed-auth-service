import type { Repository } from "typeorm";
import type { ITenant } from "../types/index.js";
import type { Tenant } from "../entity/Tenant.js";

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getAll() {
        return await this.tenantRepository.find();
    }

    async getById(tenantId: number) {
        return await this.tenantRepository.findOne({
            where: {
                id: tenantId,
            },
        });
    }

    async update(id: number, tenantData: ITenant) {
        return await this.tenantRepository.update(id, tenantData);
    }

    async deleteById(tenantId: number) {
        return await this.tenantRepository.delete(tenantId);
    }
}
