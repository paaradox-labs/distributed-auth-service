# Auth Service

A robust authentication and user-management microservice built with Node.js, Express, TypeScript, and PostgreSQL. It supports **multi-tenant** organizations, JWT-based sessions with access and refresh tokens, and **role-based** admin APIs for tenants and users.

## 📋 Overview

This service fits a microservices architecture: public registration and login, cookie-based tokens, JWKS for verifying access tokens elsewhere, and admin-only HTTP APIs to manage **tenants** and **users** (including assigning roles and tenant membership).

## 🚀 Features

- **TypeScript**: Fully typed codebase with strict type checking
- **Express.js v5**: Fast and minimalist web framework
- **PostgreSQL**: Relational database with TypeORM
- **Multi-tenancy**: `Tenant` entity; users can belong to a tenant
- **JWT authentication**: RS256 access tokens + HS256 refresh tokens
- **Token rotation**: Refresh tokens rotate on each `/auth/refresh`
- **Cookie-based auth**: httpOnly, `sameSite: strict` cookies
- **JWKS**: Public JSON Web Key Set for token verification
- **Role-based access**: Roles include `admin`, `customer`, and `manager`; JWT carries `role` for authorization
- **Admin APIs**: CRUD for `/tenants` and `/users` (admin role required where noted)
- **Logout**: Refresh token removal and cookie clearing
- **Migrations**: TypeORM migrations (`pnpm run migration:run`, etc.)
- **Input validation**: express-validator
- **Password hashing**: bcrypt
- **Logging**: Winston
- **Error handling**: Global handler with structured JSON errors
- **Code quality**: ESLint and Prettier
- **Testing**: Jest with TypeScript
- **Git hooks**: Husky and lint-staged
- **Docker**: Optional PostgreSQL and dev container
- **Hot reload**: Nodemon in development

## 🛠️ Tech Stack

- **Runtime**: Node.js (v24)
- **Language**: TypeScript
- **Framework**: Express.js v5
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken), express-jwt, jwks-rsa
- **Validation**: express-validator
- **Password hashing**: bcrypt
- **Logging**: Winston
- **Testing**: Jest with ts-jest, supertest
- **Code quality**: ESLint, Prettier
- **Process management**: Nodemon
- **Package manager**: pnpm
- **Containerization**: Docker

## 📦 Installation

### Prerequisites

- Node.js (v24 or higher)
- pnpm
- PostgreSQL
- Docker (optional, for PostgreSQL or containerized dev)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/mrpaaradox/auth-service
cd auth-service
```

2. Install dependencies:

```bash
pnpm install
```

3. Environment files are loaded by **NODE_ENV** as **`.env.<NODE_ENV>`** at the project root (for example `.env.dev` when `NODE_ENV=dev`). Create `.env.dev` with at least:

```env
PORT=5501
NODE_ENV=dev
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=auth_db
REFRESH_TOKEN_SECRET=your-refresh-token-secret
JWKS_URI=http://localhost:5501/.well-known/jwks.json
```

4. Generate RSA keys for JWT signing:

```bash
node scripts/generateKeys.mjs
```

5. Start PostgreSQL (Docker example):

```bash
pnpm run docker:db
```

6. Apply database migrations:

```bash
NODE_ENV=dev pnpm exec typeorm-ts-node-esm migration:run -d src/config/data-source.ts
```

See `scripts/migration-commands.md` for `migration:generate` and other TypeORM CLI usage.

## 🏃‍♂️ Running the Application

### Development

```bash
pnpm run dev
```

Uses `NODE_ENV=dev` and listens on the port from config (default **5501**).

### Docker (app)

Build:

```bash
pnpm run docker:build
```

Run (mounts the repo and uses your `.env`):

```bash
pnpm run docker:run
```

## 🧪 Testing

Run the full suite once (with coverage):

```bash
pnpm test
```

Watch mode:

```bash
pnpm run test:watch
```

## 📝 Scripts

| Script                        | Description                                                |
| ----------------------------- | ---------------------------------------------------------- |
| `pnpm run dev`                | Dev server with hot reload (`NODE_ENV=dev`)                |
| `pnpm run build`              | Compile TypeScript                                         |
| `pnpm run docker:build`       | Build Docker image                                         |
| `pnpm run docker:run`         | Run app container                                          |
| `pnpm run docker:db`          | Start PostgreSQL container                                 |
| `pnpm test`                   | Jest with coverage (single run)                            |
| `pnpm run test:watch`         | Jest watch mode                                            |
| `pnpm run lint:check`         | ESLint                                                     |
| `pnpm run lint:fix`           | ESLint with fix                                            |
| `pnpm run format:check`       | Prettier check                                             |
| `pnpm run format:fix`         | Prettier write                                             |
| `pnpm run migration:generate` | Generate migration from schema diff (pass path after `--`) |
| `pnpm run migration:run`      | Run pending migrations                                     |
| `pnpm run migration:create`   | Create empty migration stub                                |

## 📁 Project Structure

```
auth-service/
├── src/
│   ├── config/           # App config, logger, TypeORM data source
│   ├── controller/       # Auth, User, Tenant controllers
│   ├── entity/           # User, RefreshToken, Tenant
│   ├── middlewares/      # authenticate, validateRefreshToken, parseRefreshToken, canAccess
│   ├── migration/        # TypeORM migration files
│   ├── routes/           # auth, user, tenant routes
│   ├── services/         # User, Token, Credential, Tenant
│   ├── validators/
│   ├── types/
│   ├── constants/        # Roles (admin, customer, manager)
│   ├── app.ts
│   └── server.ts
├── certs/                # RSA keys for JWT
├── public/.well-known/   # jwks.json
├── scripts/
├── tests/
├── logs/
└── package.json
```

## 🔧 Configuration

### Environment

Config is read from **`.env.<NODE_ENV>`** (default file: `.env.dev` if `NODE_ENV` is unset). Database settings use **`DB_HOST`**, **`DB_PORT`**, **`DB_USERNAME`**, **`DB_PASSWORD`**, and **`DB_NAME`** (not a single `DATABASE_URL`).

### TypeScript

ES modules (`"module": "nodenext"`), strict mode, source maps.

### Database

- **ORM**: TypeORM with PostgreSQL
- **Entities**: `User`, `RefreshToken`, `Tenant`
- **Users** may reference a **tenant** via a many-to-one relation.

### Code quality

ESLint, Prettier, Husky, lint-staged.

## 🌐 API

### Health

`GET /` — plain text: `Welcome to Authentication Page`.

### Authentication (`/auth`)

| Method | Path             | Description                                                                                                              |
| ------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/auth/register` | Register; default role `customer`. Optional body field `tenantId` (number) to attach the user to a tenant. Sets cookies. |
| POST   | `/auth/login`    | Login; sets cookies.                                                                                                     |
| GET    | `/auth/self`     | Current user. **Auth:** Bearer or `accessToken` cookie.                                                                  |
| POST   | `/auth/refresh`  | Rotate tokens. **Auth:** `refreshToken` cookie (via refresh validation middleware).                                      |
| POST   | `/auth/logout`   | Invalidate refresh token and clear cookies. **Auth:** access + refresh flow as implemented.                              |

**Register / login body (typical):**

```json
{
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string"
}
```

You may include `"tenantId": 1` on register when linking to an existing tenant.

Successful register/login responses return user fields (role, etc.) and set **accessToken** (1h) and **refreshToken** (1y) as httpOnly cookies.

### Tenants (`/tenants`)

| Method | Path           | Auth / role                                            |
| ------ | -------------- | ------------------------------------------------------ |
| GET    | `/tenants`     | **Public** — list all tenants                          |
| GET    | `/tenants/:id` | **Authenticated**, role **admin**                      |
| POST   | `/tenants`     | **Authenticated**, **admin** — body: `name`, `address` |
| PATCH  | `/tenants/:id` | **Authenticated**, **admin** — body: `name`, `address` |
| DELETE | `/tenants/:id` | **Authenticated**, **admin**                           |

### Users (`/users`)

All routes require **authentication** and role **admin**.

| Method | Path         | Description                                                                   |
| ------ | ------------ | ----------------------------------------------------------------------------- |
| POST   | `/users`     | Create user: `firstName`, `lastName`, `email`, `password`, `role`, `tenantId` |
| GET    | `/users`     | List users                                                                    |
| GET    | `/users/:id` | Get one user                                                                  |
| PATCH  | `/users/:id` | Update `firstName`, `lastName`, `role`                                        |
| DELETE | `/users/:id` | Delete user                                                                   |

### JWKS

`GET /.well-known/jwks.json` — public keys for verifying access tokens.

### Errors

Failed requests often return JSON in the form:

```json
{
    "errors": [
        {
            "type": "ErrorName",
            "msg": "message",
            "path": "",
            "location": ""
        }
    ]
}
```

Validation errors may use express-validator’s `errors` array shape instead.

## 🔐 Security

- **RS256** for access tokens; **HS256** for refresh tokens
- **httpOnly** cookies; **sameSite: strict**
- **Refresh token rotation** and DB-backed revocation
- **bcrypt** for passwords
- **JWT `role`** used by `canAccess` for admin routes

## 📊 Logging

Winston writes under `logs/` (e.g. error and combined logs), with level driven by environment.

## 🐳 Docker

- **docker/dev/Dockerfile**: Node 24–based dev image; port **5501**.
- **`docker:db`**: local PostgreSQL for development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Push and open a Pull Request

Commits should pass lint and format checks (Husky / lint-staged).

---

Built with ❤️ using TypeScript, Express, and PostgreSQL
