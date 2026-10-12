#!/bin/bash
set -e

ENVIRONMENT="${1:?Usage: $0 <staging|prod>}"
ENV_FILE=".env.${ENVIRONMENT}"

if [ ! -f "$ENV_FILE" ]; then
    echo "Missing $ENV_FILE" >&2
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

: "${CONTAINER_PREFIX:?CONTAINER_PREFIX must be set in $ENV_FILE}"

NGINX_CONTAINER_NAME="${CONTAINER_PREFIX}nginx"

# Renew certificates
echo "Running certificate renewal..."
docker compose -f docker-compose.certbot.deploy.yml --env-file "$ENV_FILE" run --rm --no-deps certbot renew
docker exec "$NGINX_CONTAINER_NAME" nginx -s reload

echo "Renewal finished"
