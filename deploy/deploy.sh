#!/bin/bash
# =========================================================
# BeatAttend Atomic Release Deployment Script
# Usage: ./deploy.sh
# =========================================================

set -e

# Define Timestamp Release ID
RELEASE_ID=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="/var/www/beattend/releases/$RELEASE_ID"

echo "🚀 Starting BeatAttend Atomic Release Deployment: $RELEASE_ID"

# 1. Clone Repository into Release Directory
echo "📦 Cloning latest release from GitHub..."
git clone --depth 1 --branch main https://github.com/belalBH/beattend-backend.git "$RELEASE_DIR"

# 2. Symlink Shared Environment Files & Uploads
echo "🔐 Linking shared configuration and uploads..."
ln -sf /var/www/beattend/shared/backend.env "$RELEASE_DIR/.env"
mkdir -p "$RELEASE_DIR/storage"
ln -sf /var/www/beattend/shared/uploads "$RELEASE_DIR/storage/uploads"

# 3. Install Dependencies & Build Application
echo "⚡ Building Frontend and Backend bundles..."
cd "$RELEASE_DIR"
npm ci
npm run build

# 4. Pre-Switch Health Validation
echo "🔍 Validating build integrity prior to symlink switch..."
test -f "$RELEASE_DIR/frontend-dist/index.html" || { echo "❌ FAIL: Missing frontend-dist/index.html"; exit 1; }
test -f "$RELEASE_DIR/backend-dist/server.cjs" || { echo "❌ FAIL: Missing backend-dist/server.cjs"; exit 1; }
node --check "$RELEASE_DIR/backend-dist/server.cjs" || { echo "❌ FAIL: Node syntax check failed"; exit 1; }

# 5. Record Previous Release Path for Instant Rollback
if [ -L /var/www/beattend/current ]; then
    readlink -f /var/www/beattend/current > /var/www/beattend/shared/previous_release
fi

# 6. Atomic Symlink Switch
echo "🔄 Switching atomic current symlink..."
ln -nfs "$RELEASE_DIR" /var/www/beattend/current_tmp
mv -Tf /var/www/beattend/current_tmp /var/www/beattend/current

# 7. Reload PM2 & Nginx
echo "🌐 Reloading PM2 and Nginx..."
pm2 reload /var/www/beattend/current/deploy/ecosystem.config.js --env production || pm2 start /var/www/beattend/current/deploy/ecosystem.config.js --env production
sudo systemctl reload nginx

# 8. Release Retention Cleanup (Keep current, previous, and latest 3 releases)
echo "🧹 Cleaning up old releases..."
cd /var/www/beattend/releases
ls -dt */ | tail -n +6 | xargs -I {} rm -rf {}

echo "✅ BeatAttend Atomic Release $RELEASE_ID Deployed Successfully!"
