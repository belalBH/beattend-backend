# 🔄 Final Release and Rollback Plan (`FINAL_RELEASE_AND_ROLLBACK_PLAN.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**Base Path**: `/var/www/beattend`  
**Verification Status**: **`[PROPOSED - MASTER SPECIFICATION]`**  

---

## 1. Atomic Symlink Release Procedure

```bash
#!/bin/bash
set -e

RELEASE_ID=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="/var/www/beattend/releases/$RELEASE_ID"

echo "===> Starting Atomic Release: $RELEASE_ID"

# 1. Clone Repository into Release Directory
git clone --depth 1 --branch main https://github.com/belalBH/beattend-backend.git $RELEASE_DIR

# 2. Symlink Shared Environment & Storage
ln -sf /var/www/beattend/shared/backend.env $RELEASE_DIR/.env
mkdir -p $RELEASE_DIR/storage
ln -sf /var/www/beattend/shared/uploads $RELEASE_DIR/storage/uploads

# 3. Build Public Frontend & Private Backend
cd $RELEASE_DIR
npm ci
npm run build

# 4. Pre-Switch Health Validation
test -f $RELEASE_DIR/frontend-dist/index.html || { echo "FAIL: Missing frontend build"; exit 1; }
test -f $RELEASE_DIR/backend-dist/server.cjs || { echo "FAIL: Missing backend build"; exit 1; }
node --check $RELEASE_DIR/backend-dist/server.cjs || { echo "FAIL: Node syntax error"; exit 1; }

# 5. Record Previous Release Path
if [ -L /var/www/beattend/current ]; then
    readlink -f /var/www/beattend/current > /var/www/beattend/shared/previous_release
fi

# 6. Atomic Symlink Switch
ln -nfs $RELEASE_DIR /var/www/beattend/current_tmp
mv -Tf /var/www/beattend/current_tmp /var/www/beattend/current

# 7. Reload PM2 & Nginx
pm2 reload /var/www/beattend/current/deploy/ecosystem.config.js --env production
sudo systemctl reload nginx

# 8. Release Retention Cleanup (Keep Current + Previous + Latest 3 Releases)
cd /var/www/beattend/releases
ls -dt */ | tail -n +6 | xargs -I {} rm -rf {}

echo "===> Release $RELEASE_ID Deployed Successfully!"
```

---

## 2. Instant Verified Rollback Command

```bash
#!/bin/bash
set -e

if [ ! -f /var/www/beattend/shared/previous_release ]; then
    echo "ERROR: No recorded previous release found!"
    exit 1
fi

TARGET_RELEASE=$(cat /var/www/beattend/shared/previous_release)

if [ ! -d "$TARGET_RELEASE" ]; then
    echo "ERROR: Recorded rollback target $TARGET_RELEASE does not exist!"
    exit 1
fi

echo "===> Executing Instant Rollback to: $TARGET_RELEASE"

ln -nfs $TARGET_RELEASE /var/www/beattend/current_tmp
mv -Tf /var/www/beattend/current_tmp /var/www/beattend/current

pm2 reload /var/www/beattend/current/deploy/ecosystem.config.js --env production
sudo systemctl reload nginx

echo "===> Rollback Completed Successfully!"
```

---

## 3. Secure MariaDB Backup Credentials (`/var/www/beattend/shared/mysql-backup.cnf`)

File permissions: `chmod 600` owned by `deploy:www-data`.

```ini
[client]
user = beattend_user
password = "SECRET_DB_PASSWORD"
host = 127.0.0.1
port = 3306
```

### Automated Backup Command:
```bash
mariadb-dump --defaults-extra-file=/var/www/beattend/shared/mysql-backup.cnf beattend_db | gzip > /var/backups/beattend/db_$(date +%Y%m%d_%H%M%S).sql.gz
```
