FROM oven/bun:alpine as base
RUN apk --no-cache add curl
WORKDIR /app

FROM base as install
COPY package.json bun.lockb ./
RUN bun install
COPY . /app

FROM install as typecheck
RUN bun run typecheck

FROM install as lint
RUN bun run lint

FROM install as test
RUN bun test

FROM install as run
EXPOSE 5001
CMD ["bun", "run", "dev"]

