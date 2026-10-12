#!/bin/bash
set -euo pipefail

ENVIRONMENT="${1:?Usage: $0 <staging|prod>}"
REPO_DIR="/home/ubuntu/acm-website-server"

echo "[INFO] Deploying ${ENVIRONMENT} environment..."
/bin/bash "${REPO_DIR}/deploy.sh" "${ENVIRONMENT}"

echo "[INFO] Installing cron job for cert renewal..."
CRON_JOB="*/5 * * * * /bin/bash ${REPO_DIR}/renew-cert.sh ${ENVIRONMENT} >> /var/log/certbot-renew.log 2>&1"

( crontab -l 2>/dev/null | grep -F "$CRON_JOB" ) || (
    crontab -l 2>/dev/null; echo "$CRON_JOB"
) | crontab -
