# Auth Service

A robust and scalable user management microservice built with Node.js, Express, and TypeScript.

## 📋 Overview

This authentication service is designed as part of a microservices architecture to handle user management operations. It provides a solid foundation for building authentication and authorization features with modern development practices and tooling.

## 🚀 Features

- **TypeScript**: Fully typed codebase with strict type checking
- **Express.js**: Fast and minimalist web framework
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
- **Logging**: Winston
- **Testing**: Jest with ts-jest
- **Code Quality**: ESLint, Prettier
- **Process Management**: Nodemon
- **Containerization**: Docker

## 📦 Installation

### Prerequisites

- Node.js (v24 or higher)
- npm or yarn
- Docker (optional, for containerized development)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/mrpaaradox/auth-service
cd auth-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=5501
NODE_ENV=development
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 5501).

### Using Docker

Build the Docker image:
```bash
docker build -t auth-service:dev -f docker/dev/Dockerfile .
```

Run the container:
```bash
npm run docker
```

## 🧪 Testing

Run tests in watch mode:
```bash
npm test
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run docker` | Run application in Docker container |
| `npm test` | Run tests in watch mode |
| `npm run lint:check` | Check for linting errors |
| `npm run lint:fix` | Fix linting errors automatically |
| `npm run format:check` | Check code formatting |
| `npm run format:fix` | Format code automatically |

## 📁 Project Structure

```
auth-service/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main config
│   │   └── logger.ts    # Winston logger setup
│   ├── app.ts           # Express app setup
│   ├── server.ts        # Server entry point
│   └── utils.ts         # Utility functions
├── docker/
│   └── dev/
│       └── Dockerfile   # Development Dockerfile
├── dist/                # Compiled JavaScript output
├── logs/                # Application logs
├── .env.example         # Environment variables template
├── .prettierrc          # Prettier configuration
├── eslint.config.mjs    # ESLint configuration
├── jest.config.mjs      # Jest configuration
├── tsconfig.json        # TypeScript configuration
├── nodemon.json         # Nodemon configuration
└── package.json         # Project dependencies
```

## 🔧 Configuration

### TypeScript

The project uses strict TypeScript configuration with:
- ES modules (`"module": "nodenext"`)
- Strict type checking
- Source maps for debugging
- Declaration files generation

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

Built with ❤️ using TypeScript and Express
