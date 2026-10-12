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

: "${DOMAIN:?DOMAIN must be set in $ENV_FILE}"
: "${CONTAINER_PREFIX:?CONTAINER_PREFIX must be set in $ENV_FILE}"

CERTBOT_NGINX_NAME="${CONTAINER_PREFIX}certbot-nginx"

# The certbot nginx binds port 80, which the main nginx holds once the stack
# is up, so only bring it up when we actually need to issue certificates.
if [ ! -d "./certbot/conf/live/${DOMAIN}" ]; then
    echo "Issuing first certificates..."
    docker compose -f docker-compose.certbot.deploy.yml --env-file "$ENV_FILE" up -d nginx certbot
    docker compose -f docker-compose.certbot.deploy.yml --env-file "$ENV_FILE" run --rm certbot certonly \
        --webroot -w /var/www/certbot \
        -d "${DOMAIN}" -d "www.${DOMAIN}" \
        --email acm.sjsu@gmail.com \
        --agree-tos \
        --non-interactive
else
    echo "Certificates already exist. Skipping first issuance."
fi

# Free port 80 for the main nginx (no-op if it isn't running).
docker stop "$CERTBOT_NGINX_NAME" 2>/dev/null || true

echo "Starting core infra..."
docker compose -f docker-compose.deploy.yml --env-file "$ENV_FILE" up --build -d

echo "Deployment finished"
