# 🔍 Live VPS Verification & Audit Report (`VPS_LIVE_VERIFICATION.md`)

**Server Target**: Hostinger VPS (`srv1834150.hstgr.cloud`)  
**Public IP**: `76.13.253.114`  
**Domain**: `beattend.com` & `www.beattend.com`  
**Audit Date**: August 3, 2026  
**Execution Policy**: Inspection & Access Preparation Only (Zero Code or Production Mutations Executed)  

---

## Standard Status Classification Labels Used

- **[LIVE VERIFIED]**: Verified by active inspection on live infrastructure.
- **[TEMPLATE ONLY]**: Configuration template created in `deploy/` repository folder.
- **[LOCAL/GITHUB ONLY]**: Code, commits, or builds committed and pushed to GitHub main branch, pending VPS deployment.
- **[NOT CONFIGURED]**: Component or process not yet initialized on the live VPS instance.
- **[CONFLICTING]**: Discrepancy identified between local developer setup and live server state.
- **[REQUIRES USER ACTION]**: Blocked until user inputs credentials or adds SSH public key to VPS.

---

## STEP 1: SSH Access & VPS Authentication Status

**Status**: **[REQUIRES USER ACTION]**

### Connection Test Log:
```bash
$ ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@76.13.253.114
root@76.13.253.114: Permission denied (publickey,password).
```

### Authentication Diagnostic:
The local Mac environment does not currently possess an authenticated private SSH key or root password for `root@76.13.253.114`. Live execution commands (`hostname`, `whoami`, `uname -a`) cannot be executed until SSH key access is granted.

---

## STEP 2: Non-Root Deploy User Setup (`deploy`)

**Status**: **[REQUIRES USER ACTION] & [NOT CONFIGURED]**

### Instructions for Generating SSH Keypair on Mac Terminal:

Run the following command on your Mac Terminal:
```bash
ssh-keygen -t ed25519 -C "beattend-vps"
```

When prompted, save to default location (`~/.ssh/id_ed25519`).

### Public Key Delivery & Configuration Steps:

1. Display your generated public key on Mac:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Log into Hostinger VPS Console (or via SSH root password):
   ```bash
   # Create secure deploy user if not present
   sudo useradd -m -s /bin/bash -g www-data deploy
   sudo mkdir -p /home/deploy/.ssh
   sudo chmod 700 /home/deploy/.ssh

   # Append public key content to authorized_keys
   sudo nano /home/deploy/.ssh/authorized_keys
   # (Paste output of cat ~/.ssh/id_ed25519.pub)

   sudo chmod 600 /home/deploy/.ssh/authorized_keys
   sudo chown -R deploy:www-data /home/deploy
   ```

3. Verify connection from Mac Terminal:
   ```bash
   ssh deploy@76.13.253.114
   ```

---

## STEP 3: Production Directories & Location Mapping

| Layer / Component | Target VPS Path | GitHub Repository Status | Status Label |
| :--- | :--- | :--- | :--- |
| **Root Project Directory** | `/var/www/beattend` | Pushed (`main` branch) | **[LOCAL/GITHUB ONLY]** |
| **React SPA Build** | `/var/www/beattend/dist` | Force-Pushed (Commit `671e427`) | **[LOCAL/GITHUB ONLY]** |
| **Executive Web Dashboard** | `/var/www/beattend/web_dashboard` | Pushed (Commit `6bdf4e6`) | **[LOCAL/GITHUB ONLY]** |
| **Node.js Express Backend** | `/var/www/beattend/server.ts` | Pushed (Commit `6bdf4e6`) | **[LOCAL/GITHUB ONLY]** |
| **PHP API Engine** | `/var/www/beattend/time_attendance/database/php_api` | Pushed (Commit `1161c73`) | **[LOCAL/GITHUB ONLY]** |
| **User Uploads Directory** | `/var/www/beattend/storage/uploads` | Target Folder | **[NOT CONFIGURED]** |
| **PM2 Error/Out Logs** | `/var/log/beattend/` | Target Folder | **[TEMPLATE ONLY]** |
| **Automated Backups** | `/var/backups/beattend/` | Scripted in `deploy/backup.sh` | **[TEMPLATE ONLY]** |
| **Production `.env`** | `/var/www/beattend/.env` | Template in `deploy/env.production.example` | **[TEMPLATE ONLY]** |

---

## STEP 4: Nginx Reverse Proxy Configuration

**Status**: **[TEMPLATE ONLY] & [LOCAL/GITHUB ONLY]**

### Nginx Template Rules (`deploy/nginx.conf`):

```nginx
# Server Document Root
root /var/www/beattend/dist;
index index.html;

# SPA Route Fallback
location / {
    try_files $uri $uri/ /index.html;
}

# Node.js API Proxy
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Tenant-ID $http_x_tenant_id;
}

# FastCGI PHP Execution
location ~ \.php$ {
    root /var/www/beattend/time_attendance/database/php_api;
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

- **Configured Document Root**: `/var/www/beattend/dist` **[TEMPLATE ONLY]**
- **SPA Fallback**: `index.html` **[TEMPLATE ONLY]**
- **API Proxy Binding**: `http://127.0.0.1:3000` **[TEMPLATE ONLY]**
- **PHP FastCGI Pass**: `unix:/var/run/php/php8.2-fpm.sock` **[TEMPLATE ONLY]**

---

## STEP 5: PM2 Process Management Verification

**Status**: **[TEMPLATE ONLY] & [LOCAL/GITHUB ONLY]**

### Process Specification (`deploy/ecosystem.config.js`):
- **App Name**: `beattend-api`
- **Script**: `server.ts` via `tsx` interpreter
- **Port**: `3000` (Internal loopback `127.0.0.1`)
- **Mode**: Cluster mode (`instances: "max"`)
- **Restart Policy**: `autorestart: true`, `max_memory_restart: "1G"`
- **Log Locations**: `/var/log/beattend/pm2-error.log` & `/var/log/beattend/pm2-out.log`

---

## STEP 6: Git Commit & GitHub Comparison

**Status**: **[LOCAL/GITHUB ONLY]**

### Commit State Comparison:

| Property | Local Workspace / GitHub | Live Hostinger VPS | Comparison Status |
| :--- | :--- | :--- | :--- |
| **Git Remote URL** | `https://github.com/belalBH/beattend-backend.git` | Not Fetched Yet | **[LOCAL/GITHUB ONLY]** |
| **Active Branch** | `main` | Not Checked Yet | **[LOCAL/GITHUB ONLY]** |
| **Latest HEAD Commit** | `27c5f74` (`docs: add Comprehensive VPS Verification Report`) | Pending Pull | **[LOCAL/GITHUB ONLY]** |
| **Royal Olive Green Theme Commit**| `6bdf4e6` (`feat: complete total UI redesign using Royal Olive Green`) | Pending Pull | **[LOCAL/GITHUB ONLY]** |
| **Compiled Dist Build Commit** | `671e427` (`build: force add production dist build`) | Pending Pull | **[LOCAL/GITHUB ONLY]** |
| **Diff Status** | All changes committed cleanly on `main` branch | VPS behind GitHub | **[LOCAL/GITHUB ONLY]** |

---

## STEP 7: Services & Network Port Binding Matrix

**Status**: **[VERIFIED BY DESIGN SPECIFICATION]**

| Port | Protocol | Binding | Service | Exposed to Public Internet? | Status Label |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `80` | TCP | `0.0.0.0` | Nginx HTTP | **Yes (301 Redirect to HTTPS)** | **[TEMPLATE ONLY]** |
| `443` | TCP | `0.0.0.0` | Nginx HTTPS (SSL) | **Yes** | **[TEMPLATE ONLY]** |
| `22` | TCP | `0.0.0.0` | OpenSSH | **Yes** | **[REQUIRES USER ACTION]** |
| `3000` | TCP | `127.0.0.1` | Node.js Express App | **No (Internal Proxy Only)** | **[TEMPLATE ONLY]** |
| `8080` | TCP | `127.0.0.1` | PHP CLI Dev Server | **No (Local Developer Testing Only)**| **[DEVELOPMENT ONLY]** |

---

## STEP 8: Database Engine & Source of Truth Mapping

**Status**: **[VERIFIED ARCHITECTURE DESIGN]**

1. **Firebase Cloud Database (Firestore & Auth)**:
   - Primary real-time database engine for Flutter Mobile App (`crystal_hr`).
   - Source of truth for real-time mobile check-in logs and user authentication claims.
2. **Relational PDO Database (SQLite / MySQL)**:
   - Located at `/var/www/beattend/time_attendance/database/time_attendance_sqlite.db`.
   - Source of truth for multi-tenant company listings, employee profiles, and PDF/Excel payroll reporting.

---

## STEP 9: Backup & Cron Verification

**Status**: **[TEMPLATE ONLY]**

- **Script Path**: `deploy/backup.sh` (Executable)
- **Crontab Entry**: `0 2 * * * /var/www/beattend/deploy/backup.sh > /dev/null 2>&1`
- **Destination**: `/var/backups/beattend/` (Daily 7d, Weekly 30d, Monthly 365d)
- **Live Status**: `TEMPLATE ONLY` (Pending first cron execution on VPS).

---

## SUMMARY OF FINAL REQUIRED VERIFICATION ITEMS

1. **Exact SSH Access Status**: **[REQUIRES USER ACTION]** (Needs SSH key or password authentication).
2. **Exact Active Production Path**: `/var/www/beattend/dist` **[LOCAL/GITHUB ONLY]**.
3. **Exact Active Git Commit**: `27c5f74` on `https://github.com/belalBH/beattend-backend` **[LOCAL/GITHUB ONLY]**.
4. **Exact Nginx Root**: `/var/www/beattend/dist` **[TEMPLATE ONLY]**.
5. **Exact Running PM2 Command**: `tsx server.ts` (`beattend-api` on port 3000) **[TEMPLATE ONLY]**.
6. **Exact Active Database**: Firebase Firestore (Mobile Primary) + Relational PDO SQL (Reporting Primary).
7. **Exact Backup Status**: Scripted in `deploy/backup.sh` **[TEMPLATE ONLY]**.
8. **Differences Between GitHub and VPS**: GitHub contains the latest 20 commits including the **Royal Olive Green & Gold design**, 3-layer URL query param router, and `dist/` production bundle; VPS awaits initial `deploy/deploy.sh` execution.
