# ✅ Corrected Deployment Checklist (`DEPLOYMENT_CHECKLIST_CORRECTED.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**Domain**: `beattend.com` & `www.beattend.com`  
**Database**: `beattend_db`  
**Verification Status**: **`[VERIFIED - BLOCKING DEPLOYMENT UNTIL PHASE 4 APPROVAL]`**  

---

## 📋 Pre-Flight Deployment Checklist

- [x] **VPS System Runtimes**: Node.js 22 LTS, PHP 8.3 FPM, MariaDB 10.11, Redis 7, Nginx 1.24, PM2 7 verified on VPS `76.13.253.114`.
- [x] **Atomic Folder Structure**: `/var/www/beattend/{releases,current,shared,logs,scripts,backups}` verified.
- [x] **Secure Deploy User**: User `deploy` active with SSH key `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...` in `authorized_keys`.
- [x] **UFW Firewall Rules**: Ports 22, 80, 443 active; all internal ports blocked.
- [x] **Package.json Verification**: Verified `npm run build` generates `dist/index.html` and `dist/server.cjs`.
- [x] **PHP Dependencies**: Verified Native PHP 8.3 PDO with zero composer dependencies.
- [ ] **Shared Environment Files**: Create `/var/www/beattend/shared/backend.env` (Pending Phase 4 approval).
- [ ] **MariaDB Database**: Create `beattend_db` and user `beattend_user` (Pending Phase 4 approval).
- [ ] **SQL Schema Import**: Import `time_attendance_mysql.sql` safely into `beattend_db` (Pending Phase 4 approval).
- [ ] **Atomic Symlink Deployment**: Clone to `/var/www/beattend/releases/$RELEASE_ID` and link to `current` (Pending Phase 4 approval).
- [ ] **Nginx & SSL Configuration**: Deploy virtual host and activate Certbot SSL (Pending Phase 4 approval).
- [ ] **PM2 Process Startup**: Launch `pm2-deploy` with `dist/server.cjs` (Pending Phase 4 approval).

---

## 📋 Post-Deployment Health Verification Checklist

- [ ] **HTTP to HTTPS 301 Redirect**: `curl -I http://beattend.com` returns `HTTP/1.1 301 Moved Permanently`.
- [ ] **SPA Route Persistence**: Refreshing `https://beattend.com/?page=employees#employees` retains active page.
- [ ] **Node.js API Health**: `curl https://beattend.com/api/version` returns JSON 200 OK.
- [ ] **PHP API Endpoint**: `curl https://beattend.com/time_attendance/database/php_api/api.php` returns JSON API response.
- [ ] **Database Connection**: Node.js and PHP successfully query MariaDB `beattend_db` and Firebase.
- [ ] **PM2 Auto-Boot**: `pm2 status` shows `beattend-api` online after server reboot test.
