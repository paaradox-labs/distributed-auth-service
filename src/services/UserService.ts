import { Brackets, type DeepPartial, type Repository } from "typeorm";
import { User } from "../entity/User.js";
import type {
    LimitedUserData,
    UserData,
    UserQueryParams,
} from "../types/index.js";
import { Roles } from "../constants/index.js";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData): Promise<User> {
        // Check for Email
        const user = await this.userRepository.findOne({
            where: {
                email: email,
            },
        });

        // Throw error on if email is found
        if (user) {
            const error = createHttpError(400, "Email already exisits!");
            throw error;
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser: DeepPartial<User> = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
        };
        if (typeof tenantId === "number" && !Number.isNaN(tenantId)) {
            newUser.tenant = { id: tenantId };
        }

        try {
            return await this.userRepository.save(newUser);
        } catch {
            const error = createHttpError(
                500,
                "Failed to store data in database",
            );
            throw error;
        }
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                password: true,
            },
            relations: {
                tenant: true,
            },
        });
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
            },
            relations: {
                tenant: true,
            },
        });
    }

    async update(
        userId: number,
        { firstName, lastName, role, email, tenantId }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                email,
                ...(role === Roles.ADMIN
                    ? ({ tenant: null } as never)
                    : typeof tenantId === "number" && !Number.isNaN(tenantId)
                      ? { tenant: { id: tenantId } }
                      : {}),
            });
        } catch {
            const error = createHttpError(
                500,
                "Failed to update the user in the database",
            );
            throw error;
        }
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder("user");

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :q",
                        { q: searchTerm },
                    ).orWhere("user.email ILike :q", { q: searchTerm });
                }),
            );
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere("user.role = :role", {
                role: validatedQuery.role,
            });
        }

        const result = await queryBuilder
            .leftJoinAndSelect("user.tenant", "tenant")
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy("user.id", "DESC")
            .getManyAndCount();
        return result;
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
