import type { Repository } from "typeorm";
import { User } from "../entity/User.js";
import type { LimitedUserData, UserData } from "../types/index.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password, role }: UserData) {
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

        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
            });
            return user;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to store data in database",
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
        });
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id,
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to update the user in the database",
            );
            throw error;
        }
    }

    async getAll() {
        return await this.userRepository.find();
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
