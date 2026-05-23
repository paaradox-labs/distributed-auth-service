import { checkSchema } from "express-validator";

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
        notEmpty: true,
        errorMessage: "Tenant ID is required!",
        trim: true,
    },
});
