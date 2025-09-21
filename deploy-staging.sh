#!/bin/bash
set -e

NGINX_CONTAINER_NAME=nginx
MAX_WAIT=60
SLEEP_INTERVAL=5

# Start core infra
echo "Starting core infra..."
docker compose -f docker-compose.base.yml -f docker-compose.staging.yml up --build -d

# Wait until Nginx container is running
echo "Waiting for Nginx container to be ready..."
SECONDS_WAITED=0
while [ $SECONDS_WAITED -lt $MAX_WAIT ]; do
    if [ "$(docker inspect -f '{{.State.Running}}' $NGINX_CONTAINER_NAME 2>/dev/null)" == "true" ]; then
        echo "Nginx is running!"
        break
    fi
    echo "Nginx not running yet... waiting $SLEEP_INTERVAL seconds"
    sleep $SLEEP_INTERVAL
    SECONDS_WAITED=$((SECONDS_WAITED + SLEEP_INTERVAL))
done

if [ $SECONDS_WAITED -ge $MAX_WAIT ]; then
    echo "Error: Nginx container did not start within $MAX_WAIT seconds."
    exit 1
fi

# Run first certificate issuance if certs don't exist
if [ ! -d "./certbot/conf/live/staging.acmsjsu.org" ]; then
    echo "Issuing first certificates..."
    docker compose -f docker-compose.certbot.yml run --rm certbot certonly \
      --webroot -w /var/www/certbot \
      -d staging.acmsjsu.org -d www.staging.acmsjsu.org \
      --email acm.sjsu@gmail.com \
      --agree-tos \
      --non-interactive \
      --deploy-hook "docker exec $NGINX_CONTAINER_NAME nginx -s reload"
else
    echo "Certificates already exist. Skipping first issuance."
fi

# Renew certificates
echo "Running certificate renewal..."
0 3 * * 0 docker compose -f docker-compose.certbot.yml run --rm certbot renew \
  --deploy-hook "docker exec $NGINX_CONTAINER_NAME nginx -s reload"

echo "Deployment and renewal check finished"
