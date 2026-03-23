# Project Setup Guide

---

## Step 1: Git Ignore

> Shift + Cmd + P → Add gitignore as your project type.

---

## Step 2: NVM Setup

Node Version Manager setup:

1. Create a `.nvmrc` file and mention the node version your project supports (e.g., `v24.10.0`)
2. Run `nvm ls` to list available versions
3. Run `nvm use` to switch to the required version

---

## Step 3: Package.json Init

1. Create a `src` folder and a `server` file (js/ts)
2. Run `pnpm init`
3. Add dev script: `"dev"`

---

## Step 4: TypeScript Init

```bash
pnpm i -D typescript
pnpm i -D @types/node
npx tsc --init
```

Update `tsconfig.json`:
- Set `"rootDir"` to your source directory
- Set `"outDir"` for compiled output

```bash
npx tsc                 # Compile TS files
node dist/{server.js}   # Run compiled file
```

---

## Step 5: Prettier Init

```bash
pnpm add --save-dev --save-exact prettier
```

Create config files:

```bash
node --eval "fs.writeFileSync('.prettierrc','{}\n')"
node --eval "fs.writeFileSync('.prettierignore','# Ignore artifacts:\nbuild\ncoverage\n')"
```

Format files:

```bash
pnpm exec prettier . --write   # Format all files
npx prettier . --check         # Check formatting
```

Example `.prettierrc` rules:

```json
{
    "singleQuote": false,
    "semi": true,
    "tabWidth": 4
}
```

Add to `package.json`:

```json
"format:check": "npx prettier . --check",
"format:fix": "pnpm exec prettier . --write"
```

---

## Step 6: ESLint Init

```bash
pnpm add --save-dev eslint @eslint/js typescript-eslint
```

Create `eslint.config.mjs` in the project root:

```javascript
// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "no-console": "off",
            "dot-notation": "error",
        },
    },
    {
        ignores: ["dist", "node_modules", "eslint.config.mjs"],
    },
);
```

Add to `package.json`:

```json
"lint:check": "eslint .",
"lint:fix": "eslint . --fix"
```

---

## Step 7: Git Hooks

```bash
pnpm add --save-dev husky
pnpm exec husky init
```

Modify `husky/pre-commit` as needed.

```bash
pnpm add --save-dev lint-staged
```

Update `package.json`:

```json
"lint-staged": {
    "*.ts": [
        "pnpm format:fix",
        "pnpm lint:fix"
    ]
}
```

Update `pre-commit`:

```bash
pnpm exec lint-staged
```

---

## Step 8: App Configuration

1. Update TS Config → `"types": ["node"]`
2. Install dotenv: `pnpm i dotenv`
3. Create a `config` folder in `src`
4. Create `index.ts` in config

```typescript
import { config } from "dotenv";

config({
    quiet: true,
});

const { PORT, NODE_ENV } = process.env;

export const Config = {
    PORT,
    NODE_ENV,
};
```

---

## Step 9: Express Setup

```bash
pnpm i express
pnpm i -D @types/express
```

Create `src/app.ts`:

```typescript
import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to auth service");
});

export default app;
```

Create `src/server.ts`:

```typescript
import app from "./app.js";
import { Config } from "./config/index.js";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
```

Install dev dependencies: `pnpm i -D tsx nodemon tsc-node`

Create `nodemon.json`:

```json
{
    "watch": ["src"],
    "ext": ".ts,.js,.json",
    "ignore": ["src/**/*.test.ts"],
    "exec": "tsx src/server.ts",
    "env": {
        "NODE_ENV": "development"
    }
}
```

Update `package.json` dev command:

```json
"dev": "nodemon"
```

---

## Step 10: Logging (Winston)

Install: `pnpm i winston`

Create `src/config/logger.ts`:

### Console Logging

```typescript
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.prettyPrint(),
            ),
        }),
    ],
});

export default logger;
```

### File Logging

```typescript
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    transports: [
        new winston.transports.File({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.prettyPrint(),
            ),
            dirname: "logs",
            filename: "app.log",
        }),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.prettyPrint(),
            ),
        }),
    ],
});

export default logger;
```

### Silent Logs (for test environment)

```typescript
new winston.transports.Console({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
    ),
    silent: Config.NODE_ENV === "test",  // Set NODE_ENV=test
}),
```

### Use Logger in Server

```typescript
import app from "./app.js";
import { Config } from "./config/index.js";
import logger from "./config/logger.js";

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            logger.info(`Listening on PORT: ${PORT} ✅`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
```

---

## Step 11: Global Error Handling

```bash
pnpm i http-errors
pnpm i -D @types/http-errors
```

Update `src/app.ts`:

```typescript
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import logger from "./config/logger.js";
import { HttpError } from "http-errors";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to auth service");
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "root",
                location: "",
            },
        ],
    });
});

export default app;
```

---

## Step 12: Setting Up Automated Tests

### Install Jest

```bash
pnpm add --save-dev jest @types/jest ts-jest
```

### Update package.json test script

Since the project uses ESM (`"type": "module"`), we need to enable experimental VM modules:

```json
"test": "NODE_OPTIONS='--experimental-vm-modules' jest"
```

For watch mode during development:

```json
"test": "NODE_OPTIONS='--experimental-vm-modules' jest --watch"
```

### Add Jest types to TypeScript

Update `tsconfig.json`:

```json
"types": ["node", "jest"]
```

### Create Jest configuration

Create `jest.config.mjs` in the project root:

```javascript
/** @type {import("jest").Config} **/
export default {
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
};
```

### Add Jest config to ESLint ignores

Update `eslint.config.mjs`:

```javascript
{
    ignores: [
        "steps.md",
        "node_modules",
        "eslint.config.mjs",
        "jest.config.mjs",
        "package.json",
        "pnpm-lock.yaml",
        "dist",
    ],
}
```

### Create a utility function

Create `src/utils.ts`:

```typescript
export const calculateDiscount = (price: number, percentage: number) => {
    return price * (percentage / 100);
};
```

### Create a test file

Create `src/app.spec.ts`:

```typescript
import { calculateDiscount } from "./utils.js";

describe("App", () => {
    it("should return correct discount amount", () => {
        const discount = calculateDiscount(100, 10);
        expect(discount).toBe(10);
    });
});
```

### Add SuperTest for API testing

```bash
pnpm add --save-dev supertest @types/supertest
```

### Update test file with API tests

```typescript
import app from "./app.js";
import { calculateDiscount } from "./utils.js";
import request from "supertest";

describe("App", () => {
    it("should return 200 status code", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
```

### Run tests

```bash
pnpm test
```
