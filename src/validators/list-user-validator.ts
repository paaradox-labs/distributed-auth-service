import { checkSchema } from "express-validator";

export default checkSchema(
    {
        q: {
            optional: true,
            trim: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : "";
                },
            },
        },
        role: {
            optional: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : "";
                },
            },
        },

        currentPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 1 : parsedValue;
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value) => {
                    const parsedValue = Number(value);
                    return Number.isNaN(parsedValue) ? 6 : parsedValue;
                },
            },
        },
    },
    ["query"],
);
