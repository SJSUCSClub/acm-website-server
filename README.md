# acm-website-server

## Development

Copy .env.example to .env and set the correct environment variables.

```sh
cp .env.example .env
```

Start the development server with:

```sh
docker compose -f docker-compose.dev.yml up --build
```

Open http://localhost:5001

To shutdown the server and remove associated volume, run:

```sh
docker compose -f docker-compose.dev.yml down -v
```

## Documentation

Generate the documentation with:

```sh
bun run docs
```

Show Docs
```sh
bun run docs:serve
```
