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
        notEmpty: true,
        isInt: {
            options: { min: 1 },
            errorMessage: "Tenant ID must be a positive integer",
        },
        toInt: true,
    },
});
