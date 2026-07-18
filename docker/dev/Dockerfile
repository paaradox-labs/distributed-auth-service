FROM node:24

RUN corepack enable && corepack prepare pnpm@11 --activate

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 5501

CMD ["pnpm","run","dev"]