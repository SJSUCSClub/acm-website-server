#!/bin/bash
set -e

CERTBOT_NGINX_NAME=acm-certbot-nginx

docker compose -f docker-compose.certbot.yml up -d nginx certbot

if [ ! -d "./certbot/conf/live/staging.acmsjsu.org" ]; then
    echo "Issuing first certificates..."
    docker compose -f docker-compose.certbot.yml run --rm certbot certonly \
        --webroot -w /var/www/certbot \
        -d staging.acmsjsu.org -d www.staging.acmsjsu.org \
        --email acm.sjsu@gmail.com \
        --agree-tos \
        --non-interactive
else
    echo "Certificates already exist. Skipping first issuance."
fi

docker stop $CERTBOT_NGINX_NAME

echo "Starting core infra..."
docker compose -f docker-compose.staging.yml --env-file env/staging.env up --build -d

echo "Deployment finished"

