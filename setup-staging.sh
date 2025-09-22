#!/bin/bash
set -euo pipefail

echo "[INFO] Deploying staging environment..."
/bin/bash /home/ubuntu/acm-website-server/deploy-staging.sh

echo "[INFO] Installing cron job for cert renewal..."
CRON_JOB="*/5 * * * * /bin/bash /home/ubuntu/acm-website-server/renew-cert.sh >> /var/log/certbot-renew.log 2>&1"

( crontab -l 2>/dev/null | grep -F "$CRON_JOB" ) || (
    crontab -l 2>/dev/null; echo "$CRON_JOB"
) | crontab -

