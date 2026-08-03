#!/bin/bash
set -e

echo "=== 1. Starting MariaDB Service ==="
systemctl enable mariadb
systemctl start mariadb

echo "=== 2. Creating Database & User ==="
mariadb -u root -e "
CREATE DATABASE IF NOT EXISTS beattend_staging_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'beattend_staging_user'@'localhost' IDENTIFIED BY 'StagingPass2026!';
GRANT ALL PRIVILEGES ON beattend_staging_db.* TO 'beattend_staging_user'@'localhost';
FLUSH PRIVILEGES;
"

echo "=== 3. Importing Schemas & Seeds ==="
cd /var/www/beattend-staging/current/deploy
mariadb -u root beattend_staging_db < staging_schema.sql
mariadb -u root beattend_staging_db < alter_companies.sql 2>/dev/null || true
mariadb -u root beattend_staging_db < staging_employees_upgrade.sql 2>/dev/null || true
mariadb -u root beattend_staging_db < seed_5_demo_employees.sql 2>/dev/null || true
mariadb -u root beattend_staging_db < geofences_upgrade.sql 2>/dev/null || true
mariadb -u root beattend_staging_db < saas_multitenant_schema.sql 2>/dev/null || true
mariadb -u root beattend_staging_db < saas_memberships_upgrade.sql 2>/dev/null || true

echo "=== 4. Verifying Tables & Memberships ==="
mariadb -u root -e "SHOW TABLES FROM beattend_staging_db;"
mariadb -u root -e "SELECT id, email, full_name, is_platform_superadmin FROM beattend_staging_db.users;"
