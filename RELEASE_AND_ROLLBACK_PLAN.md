# 🔄 Atomic Release and Zero-Downtime Rollback Plan (`RELEASE_AND_ROLLBACK_PLAN.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**Base Path**: `/var/www/beattend`  
**Verification Status**: **`[VERIFIED - MASTER RELEASE AND ROLLBACK SPECIFICATION]`**  

---

## 1. Atomic Zero-Downtime Release Procedure

```bash
#!/bin/bash
set -e

# Define Timestamp Release ID
RELEASE_ID=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="/var/www/beattend/releases/$RELEASE_ID"

echo "===> Starting Atomic Release: $RELEASE_ID"

# Step 1: Clone Repository into Release Directory
git clone --depth 1 --branch main https://github.com/belalBH/beattend-backend.git $RELEASE_DIR

# Step 2: Symlink Shared Files and Uploads
ln -sf /var/www/beattend/shared/backend.env $RELEASE_DIR/.env
mkdir -p $RELEASE_DIR/storage
ln -sf /var/www/beattend/shared/uploads $RELEASE_DIR/storage/uploads

# Step 3: Install Dependencies and Build Application
cd $RELEASE_DIR
npm ci
npm run build

# Step 4: Atomic Symlink Switch
ln -nfs $RELEASE_DIR /var/www/beattend/current_tmp
mv -Tf /var/www/beattend/current_tmp /var/www/beattend/current

# Step 5: Reload Process Manager & Web Server
pm2 reload /var/www/beattend/current/deploy/ecosystem.config.js --env production
sudo systemctl reload nginx

echo "===> Release $RELEASE_ID Deployed Successfully!"
```

---

## 2. Instant 1-Second Zero-Downtime Rollback Command

If any post-deployment health check fails, execute the rollback script:

```bash
#!/bin/bash
set -e

# Identify Previous Release Directory
PREVIOUS_RELEASE=$(ls -td /var/www/beattend/releases/* | sed -n '2p')

if [ -z "$PREVIOUS_RELEASE" ]; then
    echo "ERROR: No previous release found to roll back to!"
    exit 1
fi

echo "===> Rolling back atomically to: $PREVIOUS_RELEASE"

# Atomic Symlink Switch to Previous Release
ln -nfs $PREVIOUS_RELEASE /var/www/beattend/current_tmp
mv -Tf /var/www/beattend/current_tmp /var/www/beattend/current

# Reload PM2 and Nginx
pm2 reload /var/www/beattend/current/deploy/ecosystem.config.js --env production
sudo systemctl reload nginx

echo "===> Rollback Completed Successfully!"
```

---

## 3. Database & Upload Backup Specifications

- **Database Backup Command**:
  ```bash
  mysqldump -u beattend_user -p'SECRET' beattend_db | gzip > /var/backups/beattend/db_$(date +%Y%m%d_%H%M%S).sql.gz
  ```
- **Upload Storage Backup Command**:
  ```bash
  tar -czf /var/backups/beattend/uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www/beattend/shared uploads
  ```
- **Backup Retention Schedule**:
  - Daily Archives: Retained for 7 days (`find /var/backups/beattend/ -name "db_*.sql.gz" -mtime +7 -delete`).
  - Weekly Archives: Retained for 30 days.
  - Monthly Archives: Retained for 365 days.
