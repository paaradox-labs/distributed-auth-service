import { checkSchema } from "express-validator";

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
});
