# 🚀 Hostinger VPS Production Deployment Guide - BeatAttend Platform

This document outlines the step-by-step production deployment process for launching **BeatAttend (`beattend.com`)** on a **Hostinger VPS (Ubuntu 22.04 LTS)** with zero downtime for the **CrystalHR Mobile App (Flutter)** and **Web Dashboard**.

---

## 📋 Checklist & Overview of Uploaded Production Assets

| Component / Asset | Description | File Path |
| :--- | :--- | :--- |
| **Nginx Config** | SSL, Reverse Proxy, Gzip, Rate Limiting, Security Headers | `deploy/nginx.conf` |
| **Env Production** | Production Environment Template | `deploy/env.production.example` |
| **PM2 Process Config** | Node.js Cluster Process Management & Logs | `deploy/ecosystem.config.js` |
| **Deployment Script** | Automated 1-Command Git Pull Deployment Script | `deploy/deploy.sh` |
| **Backup Rotation** | Daily / Weekly / Monthly Backup Script | `deploy/backup.sh` |
| **Mobile API Support** | Preserved Flutter Endpoints, JWT & FCM Push | `time_attendance/database/php_api` |

---

## 🛠️ Step-by-Step Installation Instructions on Hostinger VPS

### Step 1: Initial VPS Environment Setup
Connect to your Hostinger VPS via SSH:
```bash
ssh root@YOUR_HOSTINGER_VPS_IP
```

Update system packages and install required runtimes:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw certbot python3-certbot-nginx php8.2-fpm php8.2-sqlite3 php8.2-mysql php8.2-curl php8.2-mbstring php8.2-xml

# Install Node.js 20 LTS & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

---

### Step 2: Clone Codebase from GitHub
```bash
sudo mkdir -p /var/www/beattend
sudo chown -R $USER:$USER /var/www/beattend

cd /var/www/beattend
git clone https://github.com/belalBH/beattend-backend.git .
```

---

### Step 3: Configure Environment Variables (.env)
Copy the production environment template:
```bash
cp deploy/env.production.example .env
nano .env
```
Update all production secrets:
- `JWT_SECRET`
- `FIREBASE_PROJECT_ID` & `FIREBASE_PRIVATE_KEY`
- `DB_PASS` (for PDO MySQL)
- `MAIL_PASSWORD`

---

### Step 4: Install Dependencies & Build Web Assets
```bash
npm install --production
npm run build
```

---

### Step 5: Configure Nginx & SSL Certificate
Copy the Nginx configuration to `/etc/nginx/sites-available/beattend`:
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/beattend
sudo ln -s /etc/nginx/sites-available/beattend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Obtain Let's Encrypt SSL Certificate:
```bash
sudo certbot --nginx -d beattend.com -d www.beattend.com
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 6: Launch Application Server via PM2
```bash
mkdir -p /var/log/beattend
pm2 start deploy/ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

### Step 7: Enable Automated Cron Backups
Edit root crontab:
```bash
sudo crontab -e
```
Add the daily backup rotation trigger:
```cron
# Run daily backup at 2:00 AM
0 2 * * * /var/www/beattend/deploy/backup.sh > /dev/null 2>&1
```

---

## 🔒 Security & Performance Summary

1. **Firewall (UFW)**:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
2. **CORS & Rate Limiting**: Enforced via Nginx `limit_req_zone` (30 req/sec) and `ALLOWED_ORIGINS`.
3. **Flutter Mobile Integration**: 100% verified backward compatible with no app update required.
