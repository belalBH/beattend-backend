# 🗺️ Final Master Deployment Plan (`FINAL_DEPLOYMENT_PLAN.md`)

**Target Host**: Hostinger VPS (`76.13.253.114`)  
**Domain**: `beattend.com` & `www.beattend.com`  
**Database**: MariaDB 10.11 (`beattend_db`)  
**Downtime Classification**: **Near-Zero-Downtime**  
**Verification Status**: **`[PROPOSED - BLOCKING DEPLOYMENT UNTIL PHASE 4 APPROVAL]`**  

---

## 1. Atomic Directory Structure

```
/var/www/beattend/
├── releases/
│   └── 20260803-013000/              [Immutable timestamped release]
├── current -> releases/20260803-013000/ [Active atomic symlink]
├── shared/
│   ├── backend.env                   [Backend secrets - chmod 600]
│   ├── php.env                       [PHP secrets - chmod 600]
│   ├── mysql-backup.cnf              [MariaDB dump config - chmod 600]
│   ├── previous_release              [Recorded rollback target path]
│   └── uploads/                      [Shared user uploads - chmod 775]
├── logs/                             [Application & Nginx logs]
├── scripts/                          [Deployment & Rollback scripts]
└── /var/backups/beattend/            [Standardized backup destination]
```

---

## 2. Verified PM2 Ecosystem Configuration (`deploy/ecosystem.config.js`)

```javascript
module.exports = {
  apps: [
    {
      name: "beattend-api",
      cwd: "/var/www/beattend/current",
      script: "backend-dist/server.cjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 3000
      },
      error_file: "/var/www/beattend/logs/pm2-error.log",
      out_file: "/var/www/beattend/logs/pm2-out.log"
    }
  ]
};
```

---

## 3. Pre-Switch Validation Sequence

Before switching the active `/var/www/beattend/current` symlink, the deployment script executes pre-flight checks:

```bash
# Pre-Switch Health Validations
test -f $RELEASE_DIR/frontend-dist/index.html || { echo "FAIL: Missing frontend build"; exit 1; }
test -f $RELEASE_DIR/backend-dist/server.cjs || { echo "FAIL: Missing backend build"; exit 1; }
node --check $RELEASE_DIR/backend-dist/server.cjs || { echo "FAIL: Node syntax check failed"; exit 1; }
php -l $RELEASE_DIR/time_attendance/database/php_api/api.php || { echo "FAIL: PHP syntax check failed"; exit 1; }

# Record previous release path for instant rollback
if [ -L /var/www/beattend/current ]; then
    readlink -f /var/www/beattend/current > /var/www/beattend/shared/previous_release
fi
```
