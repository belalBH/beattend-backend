#!/bin/bash
set -e

echo "=== 1. Installing Node Dependencies ==="
cd /var/www/beattend-staging/current
npm ci

echo "=== 2. Building Frontend & Backend ==="
npm run build

echo "=== 3. Linting Build ==="
npm run lint

echo "=== 4. Setting up Environment Variables ==="
cat << 'EOF' > .env
PORT=3001
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=beattend_staging_user
DB_PASSWORD=StagingPass2026!
DB_NAME=beattend_staging_db
JWT_SECRET=BeAttendSuperSecret2026StagingJwtKey
EOF

echo "=== 5. Starting PM2 Node Application ==="
pm2 delete beattend-staging 2>/dev/null || true
pm2 start backend-dist/server.cjs --name "beattend-staging"
pm2 save

echo "=== 6. PM2 Status ==="
pm2 status
