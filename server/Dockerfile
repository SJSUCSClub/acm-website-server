FROM oven/bun:alpine as base
RUN apk --no-cache add curl
WORKDIR /app

FROM base as install
COPY package.json bun.lockb ./
RUN bun install

FROM install as run
COPY . /app
EXPOSE 5001
CMD ["bun", "run", "dev"]

