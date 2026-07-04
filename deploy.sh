#!/bin/bash
# Deploy de lab-stock al nodo HS, path-routed bajo /lab-stock junto a Hauser
# (y futuros proyectos hermanos). No usa SOPS: las dos env vars son
# NEXT_PUBLIC_* — públicas por diseño, ya viajan en el bundle del cliente.
# Uso: ./deploy.sh
set -euo pipefail

KEY="${SSH_KEY:-~/keys/LecturitasKey.pem}"
REMOTE="/srv/lab-stock/app"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST="ec2-user@hs"
SSH="ssh -i $KEY -o StrictHostKeyChecking=accept-new"

[[ ! -f "$SCRIPT_DIR/.env.local" ]] && { echo "ERROR: .env.local no encontrado."; exit 1; }
SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$SCRIPT_DIR/.env.local" | cut -d '=' -f2-)
SUPABASE_KEY=$(grep '^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=' "$SCRIPT_DIR/.env.local" | cut -d '=' -f2-)
[[ -z "$SUPABASE_URL" || -z "$SUPABASE_KEY" ]] && { echo "ERROR: faltan vars en .env.local"; exit 1; }

echo "==> Escribiendo .env.production remoto"
$SSH "$HOST" "mkdir -p $REMOTE && cat > $REMOTE/.env.production" << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_KEY
NEXT_PUBLIC_BASE_PATH=/lab-stock
EOF

echo "==> Syncing lab-stock → $HOST:$REMOTE"
rsync -az --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.env*' \
  -e "$SSH" \
  "$SCRIPT_DIR/" "$HOST:$REMOTE/"

echo "==> Instalando dependencias y build"
$SSH "$HOST" "cd $REMOTE && npm ci && npm run build"

echo "==> Recargando PM2"
$SSH "$HOST" "cd $REMOTE && pm2 startOrReload ecosystem.config.js && pm2 save"

echo "==> Status"
$SSH "$HOST" "pm2 status lab-stock"
