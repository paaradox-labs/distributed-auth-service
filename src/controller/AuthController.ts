import type { Request, Response } from "express";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entity/User.js";

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface RegisterUserRequest extends Request {
    body: UserData;
}

export class AuthController {
    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;
        const userRespository = AppDataSource.getRepository(User);
        await userRespository.save({
            firstName,
            lastName,
            email,
            password,
        });
        res.status(201).json();
    }
}
