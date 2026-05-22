import type { DeepPartial, Repository } from "typeorm";
import { User } from "../entity/User.js";
import type { LimitedUserData, UserData } from "../types/index.js";
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
        if (tenantId !== undefined) {
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
            select: [
                "id",
                "firstName",
                "lastName",
                "email",
                "role",
                "password",
            ],
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
        { firstName, lastName, role }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
            });
        } catch {
            const error = createHttpError(
                500,
                "Failed to update the user in the database",
            );
            throw error;
        }
    }

    async getAll() {
        return await this.userRepository.find({ relations: { tenant: true } });
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
