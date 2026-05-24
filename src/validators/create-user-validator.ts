import { checkSchema } from "express-validator";
import { Roles } from "../constants/index.js";

const allowedRoles = Object.values(Roles);

export default checkSchema({
    firstName: {
        trim: true,
        errorMessage: "First Name is required",
        notEmpty: true,
    },
    lastName: {
        trim: true,
        errorMessage: "Last Name is required",
        notEmpty: true,
    },
    email: {
        trim: true,
        errorMessage: "Email is required",
        notEmpty: true,
        isEmail: {
            errorMessage: "Email should be a valid email",
        },
    },
    password: {
        trim: true,
        errorMessage: "Password is required",
        notEmpty: true,
        isLength: {
            options: { min: 9 },
            errorMessage: "Password should be at least 9 characters",
        },
    },
    role: {
        trim: true,
        errorMessage: "Role is required",
        notEmpty: true,
        isIn: {
            options: [allowedRoles],
            errorMessage: `Role must be one of: ${allowedRoles.join(", ")}`,
        },
    },
    tenantId: {
        errorMessage: "Tenant ID is required",
        custom: {
            options: (value, { req }) => {
                const num = Number(value);
                const role = req.body.role;
                if (role === Roles.ADMIN) {
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
            options: (value, { req }) => {
                if (req.body.role === Roles.ADMIN) {
                    return undefined;
                }
                const num = Number(value);
                return Number.isNaN(num) ? undefined : num;
            },
        },
    },
});
