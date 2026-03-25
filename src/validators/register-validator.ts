import { checkSchema } from "express-validator";

export default checkSchema({
    firstName: {
        errorMessage: "First Name is required",
        notEmpty: true,
    },
    lastName: {
        errorMessage: "Last Name is required",
        notEmpty: true,
    },
    email: {
        errorMessage: "Email is required!",
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: "Password is required",
        notEmpty: true,
    },
});

// export default [body("email").notEmpty().withMessage("Email is required!")];
