// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        ignores: ["dist", "node_modules", "eslint.config.mjs"],
    },  
    {
        rules: {
            // "no-console": "error",
            // "dot-notation": "error",
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    },
);
