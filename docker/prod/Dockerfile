FROM node:24-alpine AS builder

RUN apk update && apk upgrade --no-cache

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_AUTO_PIN=0
RUN corepack enable

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
COPY pnpm.config.mjs ./

RUN pnpm install --frozen-lockfile --ignore-scripts --config.minimum-release-age=0

COPY . .

RUN ./node_modules/.bin/tsc -p tsconfig.json


FROM node:24-alpine AS production

RUN apk update && apk upgrade --no-cache

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_AUTO_PIN=0
RUN corepack enable

ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .npmrc ./
COPY pnpm.config.mjs ./

RUN pnpm install --frozen-lockfile --ignore-scripts --config.minimum-release-age=0

COPY --from=builder /app/dist ./

EXPOSE 5500

CMD ["node", "src/server.js"]



