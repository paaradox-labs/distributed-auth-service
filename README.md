# Auth Service

A robust and scalable authentication microservice built with Node.js, Express, TypeScript, and PostgreSQL.

## 📋 Overview

This authentication service is designed as part of a microservices architecture to handle user registration, login, and token management. It provides JWT-based authentication with access and refresh tokens, role-based access control, and secure cookie-based token storage.

## 🚀 Features

- **TypeScript**: Fully typed codebase with strict type checking
- **Express.js v5**: Fast and minimalist web framework
- **PostgreSQL**: Relational database with TypeORM
- **JWT Authentication**: RS256 access tokens + HS256 refresh tokens
- **Token Rotation**: Automatic refresh token rotation on each refresh
- **Cookie-based Auth**: httpOnly, sameSite: strict cookies for security
- **JWKS Support**: Public JSON Web Key Set for token verification
- **Input Validation**: express-validator for request validation
- **Password Hashing**: bcrypt for secure password storage
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Global error handler with structured error responses
- **Code Quality**: ESLint and Prettier for consistent code style
- **Testing**: Jest testing framework with TypeScript support
- **Git Hooks**: Pre-commit hooks with Husky and lint-staged
- **Docker Support**: Containerized development environment
- **Hot Reload**: Nodemon for automatic server restarts during development

## 🛠️ Tech Stack

- **Runtime**: Node.js (v24)
- **Language**: TypeScript
- **Framework**: Express.js v5
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken), express-jwt, jwks-rsa
- **Validation**: express-validator
- **Password Hashing**: bcrypt
- **Logging**: Winston
- **Testing**: Jest with ts-jest, supertest
- **Code Quality**: ESLint, Prettier
- **Process Management**: Nodemon
- **Package Manager**: pnpm
- **Containerization**: Docker

## 📦 Installation

### Prerequisites

- Node.js (v24 or higher)
- pnpm
- PostgreSQL
- Docker (optional, for containerized development)

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

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file:

```env
PORT=5501
NODE_ENV=development
DATABASE_URL=postgres://root:root@localhost:5432/auth_db
REFRESH_TOKEN_SECRET=your-refresh-token-secret
JWKS_URI=http://localhost:5501/.well-known/jwks.json
```

5. Generate RSA keys for JWT signing:

```bash
node scripts/generateKeys.mjs
```

6. Start PostgreSQL (using Docker):

```bash
pnpm run docker:db
```

7. Sync database schema:

```bash
pnpm run typeorm schema:sync
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
pnpm run dev
```

The server will start on the port specified in your `.env` file (default: 5501).

### Using Docker

Build the Docker image:

```bash
pnpm run docker:build
```

Run the container:

```bash
pnpm run docker:run
```

## 🧪 Testing

Run tests in watch mode:

```bash
pnpm test
```

## 📝 Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `pnpm run dev`          | Start development server with hot reload |
| `pnpm run docker:build` | Build Docker image                       |
| `pnpm run docker:run`   | Run application in Docker container      |
| `pnpm run docker:db`    | Start PostgreSQL container               |
| `pnpm test`             | Run tests in watch mode                  |
| `pnpm run lint:check`   | Check for linting errors                 |
| `pnpm run lint:fix`     | Fix linting errors automatically         |
| `pnpm run format:check` | Check code formatting                    |
| `pnpm run format:fix`   | Format code automatically                |
| `pnpm run typeorm`      | Run TypeORM CLI commands                 |

## 📁 Project Structure

```
auth-service/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # App configuration
│   │   ├── logger.ts    # Winston logger setup
│   │   └── data-source.ts # TypeORM data source
│   ├── controller/
│   │   └── AuthController.ts # Authentication controller
│   ├── entity/          # TypeORM entities
│   │   ├── User.ts      # User entity
│   │   └── RefreshTokens.ts # Refresh token entity
│   ├── middlewares/
│   │   ├── authenticate.ts # JWT authentication middleware
│   │   └── validateRefreshToken.ts # Refresh token validation
│   ├── routes/
│   │   └── auth.ts      # Authentication routes
│   ├── services/
│   │   ├── UserService.ts # User operations
│   │   ├── TokenService.ts # JWT token operations
│   │   └── CredentialService.ts # Password operations
│   ├── validators/
│   │   ├── register-validator.ts # Registration validation
│   │   └── login-validator.ts # Login validation
│   ├── types/
│   │   └── index.ts     # TypeScript type definitions
│   ├── constants/
│   │   └── index.ts     # Application constants
│   ├── app.ts           # Express app setup
│   ├── server.ts        # Server entry point
│   └── utils.ts         # Utility functions
├── certs/               # RSA keys for JWT signing
├── public/
│   └── .well-known/
│       └── jwks.json    # Public JWKS endpoint
├── scripts/
│   ├── generateKeys.mjs # RSA key generation script
│   └── convertPemToJwk.mjs # PEM to JWK conversion
├── docker/
│   └── dev/
│       └── Dockerfile   # Development Dockerfile
├── tests/               # Test files
├── logs/                # Application logs
├── .env.example         # Environment variables template
└── package.json         # Project dependencies
```

## 🔧 Configuration

### TypeScript

The project uses strict TypeScript configuration with:

- ES modules (`"module": "nodenext"`)
- Strict type checking
- Source maps for debugging
- Declaration files generation

### Database

- **ORM**: TypeORM with PostgreSQL
- **Entities**: User, RefreshToken
- **Connection**: Configured via `DATABASE_URL` in `.env`

### Code Quality

- **ESLint**: Enforces code quality and consistency
- **Prettier**: Ensures consistent code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Runs linters on staged files

## 🌐 API Endpoints

### Health Check

```
GET /
```

Returns a welcome message to verify the service is running.

**Response:**

```
Welcome to Authentication Page
```

### Authentication

All auth endpoints are prefixed with `/auth`.

#### Register User

```
POST /auth/register
```

Register a new user account.

**Request Body:**

```json
{
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string"
}
```

**Response (201):**

```json
{
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string"
}
```

Sets `accessToken` (1h) and `refreshToken` (1y) as httpOnly cookies.

#### Login

```
POST /auth/login
```

Authenticate an existing user.

**Request Body:**

```json
{
    "email": "string",
    "password": "string"
}
```

**Response (200):**

```json
{
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string"
}
```

Sets `accessToken` (1h) and `refreshToken` (1y) as httpOnly cookies.

#### Get Current User

```
GET /auth/self
```

Get the currently authenticated user's profile. Requires valid access token.

**Authentication:** Bearer token in Authorization header OR `accessToken` cookie.

**Response (200):**

```json
{
    "id": 1,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string"
}
```

#### Refresh Tokens

```
POST /auth/refresh
```

Refresh access and refresh tokens. Requires valid refresh token. Implements token rotation.

**Authentication:** `refreshToken` cookie required.

**Response (200):**

```json
{
    "id": 1
}
```

Sets new `accessToken` and `refreshToken` cookies. Old refresh token is invalidated.

### JWKS Endpoint

```
GET /.well-known/jwks.json
```

Returns the public JSON Web Key Set for token verification by other services.

## 🔐 Security

- **RS256** algorithm for access tokens (asymmetric)
- **HS256** algorithm for refresh tokens (symmetric)
- **httpOnly** cookies prevent XSS token theft
- **sameSite: strict** prevents CSRF attacks
- **Token rotation** ensures refresh tokens are single-use
- **Revocation check** validates refresh tokens against database
- **bcrypt** password hashing with salt rounds

## 📊 Logging

The service uses Winston for logging with the following features:

- Separate log files for errors and combined logs
- Structured logging format
- Configurable log levels based on environment

Logs are stored in the `logs/` directory:

- `error.log`: Error-level logs
- `combine.log`: All logs

## 🐳 Docker

The service includes a Dockerfile for development:

- Based on Node.js 24
- Exposes port 5501
- Supports volume mounting for hot reload
- Preserves node_modules in container

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses:

- ESLint for linting
- Prettier for formatting
- Pre-commit hooks to ensure code quality

All commits must pass linting and formatting checks.

---

Built with ❤️ using TypeScript, Express, and PostgreSQL
