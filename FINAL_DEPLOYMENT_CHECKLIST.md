# ✅ Final Deployment Checklist (`FINAL_DEPLOYMENT_CHECKLIST.md`)

**Target Host**: Hostinger VPS (`76.13.253.114`)  
**Domain**: `beattend.com` & `www.beattend.com`  
**Database**: `beattend_db`  
**Verification Status**: **`[PROPOSED - BLOCKING DEPLOYMENT UNTIL PHASE 4 APPROVAL]`**  

---

## 📋 Pre-Flight Checklist (Verified Requirements)

- [x] **Server Runtimes**: Node.js 22 LTS, PHP 8.3 FPM, MariaDB 10.11, Redis 7, Nginx 1.24, PM2 7 active on `76.13.253.114`.
- [x] **UFW Firewall**: Ports 22, 80, 443 open; all internal ports blocked.
- [x] **Localhost Binding**: `server.ts` configured with `const HOST = process.env.HOST || "127.0.0.1";`.
- [x] **Separate Build Directories**: `frontend-dist/` and `backend-dist/` separated.
- [x] **Deploy User Setup**: User `deploy` active with SSH key authentication.
- [ ] **Shared Secret Files**: Create `/var/www/beattend/shared/backend.env` and `php.env` (`chmod 600`) (Pending Phase 4).
- [ ] **MariaDB Database Creation**: Create `beattend_db` and user `beattend_user` (Pending Phase 4).
- [ ] **SQL Schema Migration**: Execute non-destructive schema migration into `beattend_db` (Pending Phase 4).
- [ ] **Atomic Symlink Deployment**: Clone repository into `/releases/$RELEASE_ID` and link to `current` (Pending Phase 4).
- [ ] **Nginx Configuration**: Apply `/etc/nginx/sites-available/beattend` and restart (Pending Phase 4).

---

## 📋 Post-Deployment Health Checks

- [ ] **HTTP to HTTPS 301 Redirect**: `curl -I http://beattend.com` redirects to `https://beattend.com`.
- [ ] **SPA Refresh Persistence**: Refreshing `https://beattend.com/?page=employees#employees` retains active view.
- [ ] **Node.js Health**: `curl http://127.0.0.1:3000/api/version` returns JSON 200 OK.
- [ ] **PHP API Health**: `curl https://beattend.com/time_attendance/database/php_api/api.php` returns valid API payload.
- [ ] **Auto Rollback Trigger**: Script automatically reverts symlink if any health check returns an error code.
