# ✅ Phase 3: Deployment Verification Checklist (`DEPLOYMENT_CHECKLIST.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**Domain**: `beattend.com` & `www.beattend.com`  
**Phase Status**: **`[CHECKLIST VERIFIED]`**  

---

## 📋 Pre-Deployment Verification Items

- [x] **VPS System Runtimes**: Node.js 22 LTS, PHP 8.3 FPM, MariaDB 10.11, Redis 7, Nginx 1.24, PM2 7 installed.
- [x] **Non-Root Deploy User**: `deploy` user active with SSH key authentication and `www-data` group.
- [x] **Firewall UFW Rules**: Ports 22, 80, 443 open; all internal ports blocked from public.
- [x] **Fail2Ban Security**: `sshd` jail active and monitoring.
- [x] **Directory Tree**: `/var/www/beattend/` hierarchy initialized with `775` permissions.
- [ ] **Repository Clone**: Pending Phase 4 approval.
- [ ] **Database Setup**: MariaDB database & user creation pending Phase 4.
- [ ] **Environment Configuration**: `.env` variables creation pending Phase 4.
- [ ] **Nginx & SSL**: Virtual host and Certbot TLS pending Phase 4.
- [ ] **PM2 Cluster**: Application process startup pending Phase 4.

---

## 📋 Post-Deployment Health Verification Checklist

- [ ] **HTTP 301 Redirect**: Test `http://beattend.com` redirects to `https://beattend.com`.
- [ ] **SPA Route Persistence**: Test refreshing `https://beattend.com/?page=employees#employees` retains active view.
- [ ] **API Endpoint Health**: Test `GET https://beattend.com/api/version` returns JSON 200 OK.
- [ ] **PHP API Routing**: Test `GET https://beattend.com/time_attendance/database/php_api/api.php` returns valid API response.
- [ ] **Database Connection**: Verify Node.js and PHP successfully query MariaDB and Firebase.
- [ ] **PM2 Auto-Restart**: Verify `pm2 status` shows `beattend-api` online.
