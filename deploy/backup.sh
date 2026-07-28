#!/bin/bash
# =========================================================
# BeatAttend Automated Backup Script for Hostinger VPS
# Backup Schedule: Daily / Weekly / Monthly Rotation
# =========================================================

set -e

# Setup Backup Destinations
BACKUP_BASE_DIR="/var/backups/beattend"
DATE=$(date +%Y-%m-%d_%H%M%S)
DAY_OF_WEEK=$(date +%u) # 1=Mon, 7=Sun
DAY_OF_MONTH=$(date +%d)

DAILY_DIR="$BACKUP_BASE_DIR/daily"
WEEKLY_DIR="$BACKUP_BASE_DIR/weekly"
MONTHLY_DIR="$BACKUP_BASE_DIR/monthly"

mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR"

APP_DIR="/var/www/beattend"
BACKUP_FILENAME="beattend_backup_$DATE.tar.gz"

echo "💾 Starting BeatAttend Backup for Hostinger VPS..."

# 1. Create Archive of Codebase, SQLite/MySQL DB, Uploads, and Env Configuration
tar -czf "$DAILY_DIR/$BACKUP_FILENAME" \
    --exclude="$APP_DIR/node_modules" \
    --exclude="$APP_DIR/.git" \
    --exclude="$APP_DIR/dist" \
    "$APP_DIR"

echo "✓ Daily Backup archived: $DAILY_DIR/$BACKUP_FILENAME"

# 2. Weekly Rotation (Every Sunday)
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    cp "$DAILY_DIR/$BACKUP_FILENAME" "$WEEKLY_DIR/beattend_weekly_backup_$DATE.tar.gz"
    echo "✓ Weekly Backup rotated: $WEEKLY_DIR/beattend_weekly_backup_$DATE.tar.gz"
fi

# 3. Monthly Rotation (1st of Month)
if [ "$DAY_OF_MONTH" -eq "01" ]; then
    cp "$DAILY_DIR/$BACKUP_FILENAME" "$MONTHLY_DIR/beattend_monthly_backup_$DATE.tar.gz"
    echo "✓ Monthly Backup rotated: $MONTHLY_DIR/beattend_monthly_backup_$DATE.tar.gz"
fi

# 4. Retention Cleanups
# Keep Daily backups for 7 days
find "$DAILY_DIR" -type f -name "*.tar.gz" -mtime +7 -delete

# Keep Weekly backups for 30 days
find "$WEEKLY_DIR" -type f -name "*.tar.gz" -mtime +30 -delete

# Keep Monthly backups for 365 days
find "$MONTHLY_DIR" -type f -name "*.tar.gz" -mtime +365 -delete

echo "✅ Backup Rotation Completed Successfully!"
