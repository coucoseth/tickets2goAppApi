#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/var/www/tickets2go-api"
KEY="/home/admin/.ssh/t2g_api_deploy_key"
ENV_FILE="/etc/default/tickets2go-api"
export PATH=/usr/local/bin:/usr/bin:/bin

# Ensure key perms if present
sudo -u admin test -f "$KEY" && sudo -u admin chmod 600 "$KEY" || true

if [ ! -d "$APP_DIR/.git" ]; then
  echo "ERROR: $APP_DIR is not a git repository. Clone the repo first." >&2
  exit 1
fi

# Fetch and reset
sudo -u admin env GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  git -C "$APP_DIR" fetch --all --prune
sudo -u admin git -C "$APP_DIR" reset --hard origin/main

cd "$APP_DIR"
if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Stop and delete legacy PM2 processes (id 0 and old names)
sudo -u admin pm2 delete 0 || true
sudo -u admin pm2 stop tickets2go || true
sudo -u admin pm2 delete tickets2go || true
sudo -u admin pm2 stop tickets2go-api || true
sudo -u admin pm2 delete tickets2go-api || true

# Load ENV_FILE if present into environment
if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi


# Start under PM2 directly with Node (no npm scripts) and then update env
sudo -u admin env --ignore-environment PATH="$PATH" HOME="/home/admin" $( [ -f "$ENV_FILE" ] && grep -v '^#' "$ENV_FILE" | xargs -r ) \
  pm2 start "$APP_DIR/src/app.js" --name tickets2go --interpreter /usr/bin/node

sudo -u admin pm2 restart tickets2go --update-env || true
sudo -u admin pm2 save
