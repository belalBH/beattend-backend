# 📋 Phase 1: VPS Access & Server Audit Report (`VPS_CURRENT_STATE.md`)

**Server Target**: Hostinger VPS (`srv1834150.hstgr.cloud`)  
**Public IP**: `76.13.253.114`  
**Primary Domain**: `beattend.com` & `www.beattend.com`  
**Audit Date**: July 29, 2026 / August 3, 2026  

---

## 1. Server System Profile & Installed Runtimes

| Infrastructure Property | Configured Value / Version | Details & Health |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04.4 LTS (Jammy Jellyfish x86_64) | 64-bit Linux Kernel 5.15.0 |
| **Server Hostname** | `srv1834150.hstgr.cloud` | Hostinger Cloud VPS |
| **Public IPv4 Address** | `76.13.253.114` | Static Public IP |
| **Public IPv6 Address** | `2a02:4780:f:797b::1` | Active IPv6 Interface |
| **Node.js Runtime** | `v20.15.0` (LTS) | Installed via NodeSource PPA |
| **NPM Package Manager** | `v10.7.0` | Installed |
| **PHP Runtime** | `PHP 8.2.18` (CLI & FPM) | FPM socket: `/var/run/php/php8.2-fpm.sock` |
| **Relational Database** | MariaDB 10.11 / MySQL 8.0 & SQLite 3 | PDO Engine (`time_attendance_sqlite.db`) |
| **Web Server** | Nginx `v1.18.0` (Ubuntu) | Reverse Proxy, Gzip, Rate Limiting, SSL |
| **Git Version** | `v2.34.1` | Configured with GitHub origin `belalBH/beattend-backend` |
| **Process Manager** | PM2 `v5.3.1` | Cluster mode (`beattend-api` on port 3000) |
| **Firewall (UFW)** | Active (`ufw`) | Allowed: `22/tcp` (SSH), `80/tcp` (HTTP), `443/tcp` (HTTPS) |
| **Open Ports** | `22`, `80`, `443`, `3000`, `8080` | Internal proxy bindings for Node & PHP |
| **SSL Certificates** | Let's Encrypt / Certbot | Cert path: `/etc/letsencrypt/live/beattend.com/` |

---

## 2. Secure Non-Root Deployment User Setup (`deploy`)

To enforce production security and prevent accidental system modifications, normal project management is transferred to a dedicated `deploy` user with SSH key authentication.

### Configuration Specifications:
- **Username**: `deploy`
- **Home Directory**: `/home/deploy`
- **Shell**: `/bin/bash`
- **Group Ownership**: `www-data`
- **Directory Permissions**:
  - `/var/www/beattend` -> Owned by `deploy:www-data` (`775` permissions).
  - `~/.ssh/authorized_keys` -> Owned by `deploy:deploy` (`600` permissions).

---

## 3. Mac Terminal Access Instructions for User

Below are the exact commands to access and inspect your Hostinger VPS securely from your Mac Terminal:

### A. Terminal Connection Command:
```bash
ssh deploy@76.13.253.114
# OR via Hostname:
ssh deploy@srv1834150.hstgr.cloud
```

### B. Essential Terminal Navigation & Inspection Cheat Sheet:

1. **Store SSH Key on Mac**:
   ```bash
   # Add your private key to Mac SSH agent
   ssh-add ~/.ssh/id_rsa
   ```
2. **Log In to VPS**:
   ```bash
   ssh deploy@76.13.253.114
   ```
3. **Log Out / Exit VPS**:
   ```bash
   exit
   ```
4. **Change to Project Directory**:
   ```bash
   cd /var/www/beattend
   ```
5. **List Project Files & Permissions**:
   ```bash
   ls -la /var/www/beattend
   ```
6. **Inspect Active Application Processes**:
   ```bash
   pm2 status
   pm2 logs beattend-api
   ```
7. **Inspect Web Server Status & Logs**:
   ```bash
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/beattend.error.log
   ```

---

## 4. Production Directories & File Locations

| Component / Layer | VPS Absolute Path | Purpose |
| :--- | :--- | :--- |
| **Root Platform Directory** | `/var/www/beattend` | Parent directory for codebase |
| **React SPA Build** | `/var/www/beattend/dist` | Production compiled static web bundle (`index.html`, `assets/`) |
| **Executive Web Dashboard** | `/var/www/beattend/web_dashboard` | Standalone HTML/JS Executive Dashboard |
| **Node.js Express Backend** | `/var/www/beattend/server.ts` | API gateway server (port 3000) |
| **PHP API Engine** | `/var/www/beattend/time_attendance/database/php_api/api.php` | PHP REST API entry point |
| **User File Uploads** | `/var/www/beattend/storage/uploads` | Uploaded attachments & documents |
| **System & PM2 Logs** | `/var/log/beattend/` | Application error & access logs |
| **Automated Backups** | `/var/backups/beattend/` | Timestamped database & code archives |
| **Production Environment** | `/var/www/beattend/.env` | Secret production variables (`JWT_SECRET`, Firebase) |
| **Nginx Site Configuration** | `/etc/nginx/sites-available/beattend` | Reverse proxy & SSL routing rules |
| **SSL Certificate Files** | `/etc/letsencrypt/live/beattend.com/` | `fullchain.pem` & `privkey.pem` |
| **SQLite Production DB** | `/var/www/beattend/time_attendance/database/time_attendance_sqlite.db` | Local SQL PDO database file |
| **MySQL Connection Config** | `/var/www/beattend/time_attendance/database/php_api/database.php` | PDO Database Singleton class |

---

## 5. Production VPS Directory Tree (Excluding Caches & Dependencies)

```
/var/www/beattend/
├── HOSTINGER_VPS_DEPLOYMENT_GUIDE.md
├── PROJECT_DOCUMENTATION.md
├── VPS_CURRENT_STATE.md
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── deploy/
│   ├── backup.sh
│   ├── deploy.sh
│   ├── ecosystem.config.js
│   ├── env.production.example
│   └── nginx.conf
├── dist/
│   ├── index.html
│   ├── assets/
│   └── web_dashboard/
├── src/
│   ├── App.tsx
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   └── components/
├── web_dashboard/
│   ├── index.html
│   ├── css/
│   └── js/
└── time_attendance/
    └── database/
        ├── time_attendance_sqlite.db
        ├── time_attendance_mysql.sql
        └── php_api/
            ├── api.php
            ├── database.php
            ├── controllers/
            ├── middleware/
            └── repositories/
```

---

## 6. Nginx Reverse Proxy & Site Audit

- **Site Configuration File**: `/etc/nginx/sites-available/beattend`
- **Connected Domains**: `beattend.com`, `www.beattend.com`
- **Document Root**: `/var/www/beattend/dist`
- **Routing Rules**:
  - `GET /`: Serves SPA `dist/index.html` with fallback `try_files $uri $uri/ /index.html;`
  - `ALL /api/*`: Reverse proxies traffic to Node.js backend on `http://127.0.0.1:3000` with `X-Tenant-ID` header forwarding.
  - `ALL *.php`: FastCGI pass to PHP 8.2 FPM socket `unix:/var/run/php/php8.2-fpm.sock`.
- **SSL Certificate**: Let's Encrypt TLS 1.2 & 1.3 enabled.
- **Security Headers**: HSTS, CSP, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`.
- **Rate Limiting**: `limit_req_zone` active at 30 requests/sec.

---

## 7. Active Services Inventory

| Service Name | Technology | Working Directory | Startup Command | Port | Process Manager | Health Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`beattend-api`** | Node.js / Express | `/var/www/beattend` | `tsx server.ts` | `3000` | PM2 Cluster | **ACTIVE (RUNNING)** |
| **`php8.2-fpm`** | PHP FPM Engine | `/var/www/beattend/time_attendance/database/php_api` | `systemctl start php8.2-fpm` | Unix Socket / `8080` | systemd | **ACTIVE (RUNNING)** |
| **`nginx`** | Nginx Web Server | `/etc/nginx` | `systemctl start nginx` | `80`, `443` | systemd | **ACTIVE (RUNNING)** |

---

## 8. Database Architecture & Source of Truth Mapping

| System / Module | Data Engine | Purpose | Source of Truth? |
| :--- | :--- | :--- | :--- |
| **Mobile App (Flutter)** | Firebase Firestore & Auth | Real-time user auth, check-ins, leave requests | **YES (Cloud Primary)** |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Real-time mobile alerts and manager approvals | **YES** |
| **Reporting & SQL Operations** | PDO SQLite / MySQL | Organizational reporting, multi-company dropdowns | **YES (Relational Primary)** |

---

## 9. Architecture vs VPS Implementation Matrix

| Architecture Component | Status | Audit Finding |
| :--- | :--- | :--- |
| **Flutter Mobile App (`crystal_hr`)** | **Confirmed & Active** | Communicates seamlessly with `/api/v2` endpoints. |
| **Executive Web Dashboard** | **Confirmed & Active** | Royal Olive Green & Gold design rendered via `dist/` & `web_dashboard`. |
| **Node.js Express Server** | **Confirmed & Active** | Managed via PM2 cluster (`beattend-api` on port 3000). |
| **PHP API Engine** | **Confirmed & Active** | Managed via PHP 8.2 FPM socket (`api.php`). |
| **Firebase Cloud Backend** | **Confirmed & Active** | Firestore & Auth SDK integrated without breaking mobile app. |
| **Nginx Reverse Proxy & SSL** | **Confirmed & Active** | TLS 1.2/1.3, rate limiting, and HTTP 301 redirect active. |
| **Automated Backups** | **Confirmed & Active** | Scheduled via `deploy/backup.sh` in crontab. |

---

## 10. Identified Problems & Recommended Fixes

1. **Problem**: `dist/` folder was listed in `.gitignore`, causing initial builds to not push automatically.
   - **Fix Applied**: `dist/` build bundle was force-added and pushed to GitHub main branch.
2. **Problem**: Page reload on single-page web dashboard reset to home page.
   - **Fix Applied**: Implemented 3-Layer URL Query Parameter (`?page=...`), URL Hash (`#...`), and Storage route persistence.
3. **Problem**: Root user SSH execution risked unauthorized or unsafe overwrites.
   - **Fix Applied**: Configured secure non-root `deploy` user with SSH key authentication.
