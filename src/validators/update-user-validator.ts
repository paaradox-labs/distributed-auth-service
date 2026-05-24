import { checkSchema } from "express-validator";
import type { UpdateUserRequest } from "../types/index.js";

export default checkSchema({
    firstName: {
        trim: true,
        notEmpty: true,
        errorMessage: "First Name is required!",
    },
    lastName: {
        trim: true,
        notEmpty: true,
        errorMessage: "Last Name is required!",
    },
    role: {
        trim: true,
        notEmpty: true,
        errorMessage: "Role is required!",
    },
    email: {
        isEmail: {
            errorMessage: "Invalid email!",
        },
        trim: true,
        notEmpty: true,
        errorMessage: "Email is required!",
    },
    tenantId: {
        trim: true,
        errorMessage: "Tenant ID is required",
        custom: {
            options: (value, { req }) => {
                const num = Number(value);
                const role = (req as UpdateUserRequest).body.role;
                if (role === "admin") {
                    return true;
                }
                if (!value) {
                    throw new Error("Tenant ID is required");
                }
                if (!Number.isInteger(num) || num < 1) {
                    throw new Error("Tenant ID must be a positive integer");
                }
                return true;
            },
        },
        customSanitizer: {
            options: (value) => {
                const num = Number(value);
                return Number.isNaN(num) ? undefined : num;
            },
        },
    },
});
