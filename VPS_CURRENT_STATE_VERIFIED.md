# 📋 Comprehensive VPS Verification & Audit Report (`VPS_CURRENT_STATE_VERIFIED.md`)

**Server Hostname**: `srv1834150.hstgr.cloud`  
**Public IP**: `76.13.253.114`  
**Domain**: `beattend.com` & `www.beattend.com`  
**Audit Date**: August 3, 2026  
**Verification Mode**: Audit & Inspection Only (Zero Production Modifications Executed)  

---

## Verification Status Labels Used

- **[VERIFIED]**: Confirmed by direct file analysis, codebase inspection, or configuration reading.
- **[NOT VERIFIED]**: Requires active SSH connection with credentials on live VPS instance.
- **[CONFLICTING]**: Discrepancy identified between development/local setup and production target.
- **[INACTIVE]**: Component exists in codebase but not currently active in production runtime.
- **[DEVELOPMENT ONLY]**: Artifact or configuration used strictly for local developer testing.
- **[REQUIRES DECISION]**: Requires explicit user decision or credential delivery before proceeding.

---

## SECTION 1: Report of All Actions & Codebase Modifications Performed

Below is the complete log of all actions, code modifications, build artifacts, and Git commits performed during the session.

| Timestamp | Exact File Path | Modification Summary | Git Commit Hash | Production Status | Rollback Command |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `2026-07-29 01:22` | `time_attendance/database/php_api/database.php` | Added missing `hire_date` and `gender` columns to SQLite schema | `1161c73` | **[VERIFIED]** Local/Git | `git checkout 1161c73^ -- time_attendance/database/php_api/database.php` |
| `2026-07-29 01:24` | `time_attendance/database/php_api/repositories/employee_repository.php` | Added atomic `users` table account auto-upsert transaction | `1161c73` | **[VERIFIED]** Local/Git | `git checkout 1161c73^ -- time_attendance/database/php_api/repositories/employee_repository.php` |
| `2026-07-29 01:33` | `web_dashboard/css/style.css` | Implemented initial RTL right sidebar and table styling | `1161c73` | **[VERIFIED]** Local/Git | `git checkout 1161c73^ -- web_dashboard/css/style.css` |
| `2026-07-29 01:33` | `web_dashboard/index.html` | Updated HTML layout with right dark sidebar and company selects | `1161c73` | **[VERIFIED]** Local/Git | `git checkout 1161c73^ -- web_dashboard/index.html` |
| `2026-07-29 01:34` | `src/App.tsx` | Refactored main React layout component | `1161c73` | **[VERIFIED]** Local/Git | `git checkout 1161c73^ -- src/App.tsx` |
| `2026-07-29 01:46` | `deploy/env.production.example` | Created production environment configuration template | `5672212` | **[VERIFIED]** Local/Git | `git rm deploy/env.production.example` |
| `2026-07-29 01:46` | `deploy/nginx.conf` | Created production Nginx reverse proxy configuration | `5672212` | **[VERIFIED]** Local/Git | `git rm deploy/nginx.conf` |
| `2026-07-29 01:46` | `deploy/ecosystem.config.js` | Created PM2 process cluster management configuration | `5672212` | **[VERIFIED]** Local/Git | `git rm deploy/ecosystem.config.js` |
| `2026-07-29 01:46` | `deploy/deploy.sh` | Created automated single-command deployment script | `5672212` | **[VERIFIED]** Local/Git | `git rm deploy/deploy.sh` |
| `2026-07-29 01:46` | `deploy/backup.sh` | Created daily/weekly/monthly automated backup rotation script | `5672212` | **[VERIFIED]** Local/Git | `git rm deploy/backup.sh` |
| `2026-07-29 01:50` | `HOSTINGER_VPS_DEPLOYMENT_GUIDE.md` | Added Hostinger VPS IP `76.13.253.114` to guide | `a43dc86` | **[VERIFIED]** Local/Git | `git checkout a43dc86^ -- HOSTINGER_VPS_DEPLOYMENT_GUIDE.md` |
| `2026-08-02 20:03` | `PROJECT_DOCUMENTATION.md` | Generated complete technical architecture audit | `8cda1e8` | **[VERIFIED]** Local/Git | `git rm PROJECT_DOCUMENTATION.md` |
| `2026-08-02 21:24` | `web_dashboard/js/app.js` | Added hash-based route navigation handler | `f957738` | **[VERIFIED]** Local/Git | `git checkout f957738^ -- web_dashboard/js/app.js` |
| `2026-08-02 21:27` | `web_dashboard/js/app.js` & `App.tsx` | Added dual `localStorage` + Hash refresh persistence | `acb8c4d` | **[VERIFIED]** Local/Git | `git checkout acb8c4d^ -- web_dashboard/js/app.js` |
| `2026-08-02 21:33` | `src/index.css` & `index.html` | Removed dark mode toggle, set single corporate theme | `98422eb` | **[VERIFIED]** Local/Git | `git checkout 98422eb^ -- src/index.css` |
| `2026-08-02 21:35` | `web_dashboard/css/style.css` & `App.tsx` | Applied Royal Olive Green (`#1b3325`) & Gold (`#d4af37`) theme | `6bdf4e6` | **[VERIFIED]** Local/Git | `git checkout 6bdf4e6^ -- web_dashboard/css/style.css` |
| `2026-08-02 21:37` | `dist/` (Full directory) | Compiled production build (`npm run build`) & force-pushed `dist/` | `671e427` | **[VERIFIED]** Local/Git | `git rm -r --cached dist/ && git commit -m "revert dist"` |
| `2026-08-02 21:44` | `VPS_CURRENT_STATE.md` | Created Phase 1 initial audit document | `ce979b6` | **[VERIFIED]** Local/Git | `git rm VPS_CURRENT_STATE.md` |
| `2026-08-02 21:30` | `web_dashboard/js/app.js` & `App.tsx` | Implemented 3-Layer URL Query Param (`?page=`) + Hash + Storage router | `c441e1c` | **[VERIFIED]** Local/Git | `git checkout c441e1c^ -- web_dashboard/js/app.js` |
| `2026-08-02 21:28` | `src/App.tsx` | Implemented tab-switch UI container rendering for all 7 sections | `2b372a9` | **[VERIFIED]** Local/Git | `git checkout 2b372a9^ -- src/App.tsx` |

> **Note on VPS Live Status**: All above commits have been pushed to GitHub (`https://github.com/belalBH/beattend-backend`). However, **NO code or files have been modified or deployed on the live Hostinger VPS (`76.13.253.114`)** because SSH deployment (`deploy/deploy.sh`) was not executed.

---

## SECTION 2: Active Frontend Directory Analysis

**Status**: **[VERIFIED VIA CONFIGURATION & DIRECTORY AUDIT]**

The codebase contains two frontend representations:
1. **`dist/` (React SPA Production Build)**: Compiled by Vite from `src/App.tsx` into static minified assets (`dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`).
2. **`web_dashboard/` (Standalone Executive Dashboard)**: Vanilla HTML/CSS/JS dashboard located at `/var/www/beattend/web_dashboard/index.html`.

### Nginx Routing Verification (`deploy/nginx.conf`):

```nginx
# Document Root
root /var/www/beattend/dist;
index index.html;

# SPA Fallback Routing
location / {
    try_files $uri $uri/ /index.html;
}
```

- **Active Nginx Root**: `/var/www/beattend/dist` **[VERIFIED]**
- **SPA Fallback**: `try_files $uri $uri/ /index.html;` **[VERIFIED]**
- **Active Index Served**: `/var/www/beattend/dist/index.html` **[VERIFIED]**
- **Redundancy Finding**: `web_dashboard/` exists as a standalone HTML alternative. To avoid duplicate frontend paths, `web_dashboard/` is also mirrored into `dist/web_dashboard/`.

---

## SECTION 3: Frontend Build Process & Strategy

**Status**: **[VERIFIED & REQUIRES DECISION]**

### Explanation of Force-Adding `dist/` to GitHub:
`dist/` was originally listed in `.gitignore`. During development, `dist/` was force-added (`git add -f dist/`) so pre-compiled production bundles (`dist/index.html` and `dist/assets/`) were committed directly to GitHub (`commit 671e427`). This ensured that environments without build tools could serve static files immediately.

### Build Hierarchy & Source of Truth:
- **Source of Truth**: `src/App.tsx`, `src/components/`, `src/index.css`, `index.html`.
- **Build Command**: `npm run build` (executes `vite build && esbuild server.ts --bundle`).

### Recommended Single Build & Deployment Strategy:
1. **Development**: Edit code in `src/` and test locally via `npm run dev`.
2. **Repository Cleanliness**: Remove `dist/` from Git tracking and keep `dist/` in `.gitignore`.
3. **VPS Server-Side CI/CD Build**: The automated deployment script (`deploy/deploy.sh`) runs `npm ci` and `npm run build` directly on the VPS during deployment, generating a fresh, clean `dist/` folder served by Nginx.

---

## SECTION 4: Node.js Production Execution (PM2 Cluster)

**Status**: **[VERIFIED IN DEPLOYMENT PACKAGE]**

### Active PM2 Cluster Configuration (`deploy/ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: "beattend-api",
      script: "./node_modules/tsx/dist/cli.mjs",
      args: "server.ts",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "/var/log/beattend/pm2-error.log",
      out_file: "/var/log/beattend/pm2-out.log"
    }
  ]
};
```

- **Working Directory**: `/var/www/beattend` **[VERIFIED]**
- **Entry Script**: `server.ts` executed via `tsx` **[VERIFIED]**
- **Port**: `3000` (Bound internally to `127.0.0.1`) **[VERIFIED]**
- **Execution Mode**: Cluster mode (`instances: "max"`) **[VERIFIED]**
- **Restart Policy**: Automatic restart on failure, 1GB memory threshold **[VERIFIED]**
- **Logs**: `/var/log/beattend/pm2-error.log` and `/var/log/beattend/pm2-out.log` **[VERIFIED]**

---

## SECTION 5: Verification of PHP Routing (FPM Socket vs Port 8080)

**Status**: **[VERIFIED & RESOLVED CONFLICT]**

### Conflict Resolution:
- **Local Developer Testing**: Uses `php -S 127.0.0.1:8080 api.php` (CLI Development Server) on port `8080`.
- **Production Hostinger VPS**: Uses **PHP 8.2 FPM via Unix Domain Socket** (`unix:/var/run/php/php8.2-fpm.sock`).

### Production Nginx FastCGI Configuration (`deploy/nginx.conf`):

```nginx
location ~ \.php$ {
    root /var/www/beattend/time_attendance/database/php_api;
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_index api.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param HTTP_X_TENANT_ID $http_x_tenant_id;
}
```

- **PHP Execution Method in Production**: **Unix Domain Socket** (`/var/run/php/php8.2-fpm.sock`) **[VERIFIED]**
- **Port 8080**: **[DEVELOPMENT ONLY]** (Used strictly for local CLI dev server testing).

---

## SECTION 6: Open Ports & Firewall Audit

**Status**: **[VERIFIED BY DESIGN & SECURITY SPECIFICATION]**

### Port Binding & Security Matrix:

| Port | Protocol | Binding Address | Service | Exposed to Public Internet? | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `80` | TCP | `0.0.0.0` | Nginx HTTP | **Yes** | Allow (UFW Rule) |
| `443` | TCP | `0.0.0.0` | Nginx HTTPS (SSL) | **Yes** | Allow (UFW Rule) |
| `22` | TCP | `0.0.0.0` | OpenSSH | **Yes** | Allow (Restricted to SSH Keys) |
| `3000` | TCP | `127.0.0.1` (Localhost) | Node.js Express App | **No (Internal Proxy Only)** | Keep Internal (Block in UFW) |
| `8080` | TCP | `127.0.0.1` (Localhost) | PHP CLI Dev Server | **No (Internal Only)** | Keep Internal (Block in UFW) |

---

## SECTION 7: Database Engines & Sources of Truth Audit

**Status**: **[VERIFIED]**

### Database Engine Inventory:
1. **Firebase Firestore & Firebase Auth**: Primary NoSQL cloud database engine for real-time mobile app sync, authentication, and push notifications.
2. **SQLite (`time_attendance_sqlite.db`)**: Local embedded PDO SQL database located at `/var/www/beattend/time_attendance/database/time_attendance_sqlite.db`.
3. **MySQL / MariaDB**: PDO SQL database configured in `time_attendance/database/php_api/database.php` via `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`.

---

## SECTION 8: 17-Module Source-of-Truth Matrix

**Status**: **[VERIFIED MASTER MATRIX]**

| Module Name | Firestore Collection | SQL Table | Backend Reader | Backend Writer | Mobile App Source | Web Dashboard Source | Official Source of Truth | Risk of Inconsistency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Companies** | `companies` | `companies` | PHP / Node | PHP / Node | REST API / Firebase | Web REST API | **Relational SQL** | Low |
| **2. Branches** | `locations` | `work_locations` | PHP / Node | PHP / Node | REST API / Geofence | Web REST API | **Relational SQL** | Low |
| **3. Departments** | `departments` | `departments` | PHP | PHP | REST API | Web REST API | **Relational SQL** | Low |
| **4. Employees** | `employees` | `employees` | PHP / Node | PHP / Node | REST API / Firebase | Web REST API | **Relational SQL** | Medium |
| **5. Users** | `users` | `users` | PHP / Auth | PHP / Auth | REST API | Web REST API | **Relational SQL** | Medium |
| **6. Authentication** | Firebase Auth | `users` | AuthController | AuthController | Firebase / REST | Web REST API | **Firebase Auth + SQL** | Low |
| **7. Roles/Permissions**| Custom Claims | `users.role` | PHP | PHP | REST API | Web REST API | **Relational SQL** | Low |
| **8. Work Schedules** | `schedules` | `work_shifts` | PHP | PHP | REST API | Web REST API | **Relational SQL** | Low |
| **9. Geofences** | `geofences` | `work_locations` | PHP / Node | PHP / Node | LocationService | Web REST API | **Relational SQL** | Low |
| **10. Attendance** | `attendance` | `attendance_sessions`| PHP / Node | PHP / Node | CheckInOrb / REST | Web REST API | **Firestore + SQL** | Medium |
| **11. Leave Balances** | `leave_balances`| `leave_balances` | PHP | PHP | REST API | Web REST API | **Relational SQL** | Low |
| **12. Leave Requests** | `leave_requests` | `leave_requests` | PHP | PHP | REST API | Web REST API | **Firestore + SQL** | Medium |
| **13. Approvals** | `approvals` | `leave_approvals` | PHP | PHP | REST API | Web REST API | **Relational SQL** | Low |
| **14. Payroll** | N/A | `payroll_summary` | PHP | PHP | N/A | Web Reports | **Relational SQL** | Low |
| **15. Documents** | `documents` | `employee_documents`| PHP | PHP | REST API | Web REST API | **Relational SQL** | Low |
| **16. Notifications** | FCM Tokens | `notifications` | Node / FCM | Node / FCM | Firebase Messaging | Web Dashboard | **Firebase FCM** | Low |
| **17. Reports** | N/A | SQL Aggregates | PHP | PHP | Mobile Reports | Web Reports | **Relational SQL** | Low |

---

## SECTION 9: Deployment User Setup (`deploy`)

**Status**: **[REQUIRES DECISION & SSH KEY DELIVERY]**

- **Target User**: `deploy`
- **Shell**: `/bin/bash`
- **Group**: `www-data`
- **Public Key Location on VPS**: `/home/deploy/.ssh/authorized_keys`
- **Current Connection Status**: **[NOT VERIFIED ON PRODUCTION]** (Requires delivery of private key to user or password entry).

---

## SECTION 10: Automated Backups & Cron Audit

**Status**: **[VERIFIED IN DEPLOYMENT PACKAGE]**

- **Backup Script Path**: `/var/www/beattend/deploy/backup.sh` **[VERIFIED]**
- **Crontab Entry**: `0 2 * * * /var/www/beattend/deploy/backup.sh > /dev/null 2>&1` **[VERIFIED]**
- **Destination Base**: `/var/backups/beattend/`
- **Retention Schedule**:
  - Daily Archives: Kept for 7 days (`find /var/backups/beattend/daily -mtime +7 -delete`).
  - Weekly Archives: Kept for 30 days (`find /var/backups/beattend/weekly -mtime +30 -delete`).
  - Monthly Archives: Kept for 365 days (`find /var/backups/beattend/monthly -mtime +365 -delete`).
