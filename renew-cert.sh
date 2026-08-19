#!/bin/bash
set -e

NGINX_CONTAINER_NAME=acm-nginx

# Renew certificates
echo "Running certificate renewal..."
docker compose -f docker-compose.certbot.yml run --rm --no-deps certbot renew
docker exec $NGINX_CONTAINER_NAME nginx -s reload

echo "Renewal finished"
