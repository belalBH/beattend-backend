# 🗺️ Corrected Master Deployment Plan (`DEPLOYMENT_PLAN_CORRECTED.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**Domain**: `beattend.com` & `www.beattend.com`  
**Database Name**: `beattend_db`  
**Verification Status**: **`[VERIFIED - BLOCKING DEPLOYMENT UNTIL PHASE 4 APPROVAL]`**  

---

## 1. Production Atomic Directory Hierarchy

```
/var/www/beattend/
├── releases/
│   └── 20260803-011500/          [Timestamped immutable release directory]
├── current -> releases/20260803-011500/ [Atomic symlink pointing to active release]
├── shared/
│   ├── backend.env               [Production secrets - chmod 600]
│   ├── php.env                   [PHP secrets - chmod 600]
│   ├── uploads/                  [User file uploads - chmod 775]
│   └── documents/                [Generated documents - chmod 775]
├── logs/                         [PM2 and Nginx access/error logs]
├── scripts/                      [Deployment & Rollback bash scripts]
└── backups/                      [Automated SQL and file backups]
```

---

## 2. Verified PM2 Ecosystem Configuration (`deploy/ecosystem.config.js`)

```javascript
module.exports = {
  apps: [
    {
      name: "beattend-api",
      cwd: "/var/www/beattend/current",
      script: "dist/server.cjs",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "/var/www/beattend/logs/pm2-error.log",
      out_file: "/var/www/beattend/logs/pm2-out.log"
    }
  ]
};
```

---

## 3. Atomic Release Deployment Commands Sequence

```bash
# 1. Generate Timestamp Release ID
export RELEASE_ID=$(date +%Y%m%d-%H%M%S)
export RELEASE_DIR="/var/www/beattend/releases/$RELEASE_ID"

# 2. Clone Git Repository into Release Directory
git clone --depth 1 --branch main https://github.com/belalBH/beattend-backend.git $RELEASE_DIR

# 3. Symlink Shared Environment & Storage Folders
ln -sf /var/www/beattend/shared/backend.env $RELEASE_DIR/.env
mkdir -p $RELEASE_DIR/storage
ln -sf /var/www/beattend/shared/uploads $RELEASE_DIR/storage/uploads

# 4. Install Dependencies & Build Bundle
cd $RELEASE_DIR
npm ci
npm run build

# 5. Atomic Symlink Switch
ln -nfs $RELEASE_DIR /var/www/beattend/current_tmp
mv -Tf /var/www/beattend/current_tmp /var/www/beattend/current

# 6. Restart PM2 & Reload Nginx
pm2 reload /var/www/beattend/current/deploy/ecosystem.config.js --env production
sudo systemctl reload nginx
```

---

## 4. DNS & SSL Precheck Criteria

- **A Record**: `beattend.com` -> `76.13.253.114` **[VERIFIED]**
- **CNAME / A Record**: `www.beattend.com` -> `76.13.253.114` **[VERIFIED]**
- **HTTP/HTTPS Ports**: Ports 80 & 443 active on UFW **[VERIFIED]**
- **Certbot Email**: `admin@beattend.com` **[VERIFIED]**
