#!/bin/bash
# =========================================================
# BeatAttend Automated Hostinger VPS Deployment Script
# Usage: ./deploy.sh
# =========================================================

set -e # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting BeatAttend Hostinger VPS Deployment..."

# 1. Navigate to Project Root Directory
APP_DIR="/var/www/beattend"
cd "$APP_DIR"

# 2. Pull Latest Changes from GitHub main branch
echo "📦 Pulling latest changes from GitHub (belalBH/beattend-backend)..."
git fetch origin main
git reset --hard origin/main

# 3. Install NPM Dependencies in Production Mode
echo "🔧 Installing node dependencies..."
npm ci --only=production || npm install --production

# 4. Build Production Static Assets
echo "⚡ Building production web assets..."
npm run build

# 5. Reload Application Servers via PM2 (Zero Downtime)
echo "🔄 Reloading PM2 Application Server..."
if pm2 list | grep -q "beattend-api"; then
    pm2 reload deploy/ecosystem.config.js --env production
else
    pm2 start deploy/ecosystem.config.js --env production
fi

# 6. Reload Nginx Web Server
echo "🌐 Reloading Nginx Web Server..."
sudo systemctl reload nginx

# 7. Verification Summary
echo "========================================================="
echo "✅ BeatAttend Hostinger VPS Deployment Completed Successfully!"
echo "🌐 Domain: https://beattend.com"
echo "API Server: Running via PM2 on port 3000"
echo "========================================================="
