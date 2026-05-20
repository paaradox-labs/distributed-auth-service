/** @type {import("jest").Config} **/
export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        // MSW CJS uses require("until-async"); that package is ESM-only — map to a CJS shim.
        "^until-async$": "<rootDir>/tests/shims/until-async.cjs",
    },
    verbose: true,
    collectCoverage: true,
    coverageProvider: "v8",
    collectCoverageFrom: [
        "src/**/*.ts",
        "!tests/**",
        "!**/node_modules/**",
        "!src/migration/**",
        "!src/types/**",
        // TypeORM entity metadata inflates branch counts without meaningful runtime tests.
        "!src/entity/**",
        "!src/seed.ts",
    ],
    transform: {
        "^.+\\.(ts|js)$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "<rootDir>/tsconfig.test.json",
            },
        ],
    },
    // pnpm nests deps under node_modules/.pnpm/<pkg>/node_modules/<name>/ — the
    // naive (?!msw/) pattern never matches there, so ESM-only deps (until-async)
    // were not transformed. Allow both hoisted and pnpm paths for these packages.
    transformIgnorePatterns: [
        "node_modules/(?!(?:mock-jwks|msw|until-async)/|\\.pnpm/(?:[^/]+/)+node_modules/(?:mock-jwks|msw|until-async)/)",
    ],
};
