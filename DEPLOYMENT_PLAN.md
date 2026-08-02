# 🗺️ Phase 3: Master Deployment Plan (`DEPLOYMENT_PLAN.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**Domain**: `beattend.com` & `www.beattend.com`  
**Phase Status**: **`[DEPLOYMENT PLAN VERIFIED & READY FOR PHASE 4]`**  

---

## 1. System Architecture & Flow Diagrams

### Web Dashboard & Frontend Flow:
```text
GitHub (main)
     ↓ git pull
/var/www/beattend/
     ↓ npm ci && npm run build
/var/www/beattend/frontend/dist/ (HTML / JS / CSS)
     ↓
Nginx Reverse Proxy (Port 80 / 443 HTTPS SSL)
     ↓
Client Web Browser (Royal Olive Green & Gold Design)
```

### Mobile App & Backend Flow:
```text
Flutter Mobile App (iOS / Android)
     ↓ HTTPS REST Requests
Nginx Proxy (/api/* & *.php)
     ├── Proxy Pass http://127.0.0.1:3000 ──> PM2 (Node.js Express / server.ts)
     └── FastCGI unix:php8.3-fpm.sock    ──> PHP 8.3 REST API (api.php)
     ↓                                          ↓
Firebase Firestore & Auth Engine          MariaDB / SQLite Database
```

---

## 2. Step-by-Step Production Deployment Pipeline

### Step 1: Repository Clone & Release Preparation
```bash
git clone https://github.com/belalBH/beattend-backend.git /var/www/beattend/releases/release-latest
```

### Step 2: Environment File Configuration
```bash
cp /var/www/beattend/deploy/.env.production /var/www/beattend/backend/.env
```

### Step 3: Dependency Installation & Compilation
```bash
# Frontend & Node Backend Build
cd /var/www/beattend
npm ci
npm run build

# PHP Dependencies
cd /var/www/beattend/time_attendance/database/php_api
composer install --no-dev --optimize-autoloader
```

### Step 4: Database Initialization & Migration
```bash
mysql -u beattend_user -p beattend_db < time_attendance/database/time_attendance_mysql.sql
```

### Step 5: Nginx Site Virtual Host & SSL Activation
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/beattend
sudo ln -sf /etc/nginx/sites-available/beattend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d beattend.com -d www.beattend.com --non-interactive --agree-tos -m admin@beattend.com
```

### Step 6: PM2 Cluster Process Launch
```bash
pm2 start deploy/ecosystem.config.js --env production
pm2 save
```

### Step 7: Automated Backup Crontab Registration
```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/beattend/deploy/backup.sh > /dev/null 2>&1") | crontab -
```
