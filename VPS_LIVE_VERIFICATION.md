# 🔍 Empirical Live VPS Verification & Audit Report (`VPS_LIVE_VERIFICATION.md`)

**Target Server**: Hostinger VPS (`srv1834150.hstgr.cloud`)  
**Public IPv4**: `76.13.253.114`  
**Public IPv6**: `2a02:4780:f:797b::1`  
**SSH Connection Test**: **`[LIVE VERIFIED - SUCCESSFUL SSH AUTHENTICATION]`**  
**Audit Timestamp**: August 3, 2026 01:04 AM UTC+3  

---

## Executive Summary of Empirical Findings

Direct live SSH inspection of `root@76.13.253.114` reveals that **Hostinger VPS `srv1834150.hstgr.cloud` is a brand-new, clean Ubuntu 24.04.4 LTS installation**.

- **OS & Kernel**: **Ubuntu 24.04.4 LTS (Noble Numbat)** running Linux Kernel `6.8.0-134-generic x86_64`.
- **Installed Runtime Runtimes**: Only `git` (v2.43.0) and system tools are installed. Node.js, PHP, Nginx, MySQL/MariaDB, and PM2 are **not yet installed**.
- **Active Listening Ports**: Port `22` (SSH) is listening. Web ports `80`, `443`, `3000`, `8080` are not yet active.
- **Directory Structure**: `/var/www/` does not exist yet.
- **User Accounts**: `deploy` user does not exist yet.

---

## STEP 1: Live System Output & Server OS Profile

**Status**: **[LIVE VERIFIED]**

### Command Output Log (`root@76.13.253.114`):

```bash
$ hostname
srv1834150

$ hostname -I
76.13.253.114 2a02:4780:f:797b::1

$ whoami
root

$ pwd
/root

$ uname -a
Linux srv1834150 6.8.0-134-generic #134-Ubuntu SMP PREEMPT_DYNAMIC Fri Jun 26 18:43:11 UTC 2026 x86_64 GNU/Linux

$ cat /etc/os-release
PRETTY_NAME="Ubuntu 24.04.4 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.4 LTS (Noble Numbat)"
VERSION_CODENAME=noble
ID=ubuntu
```

---

## STEP 2: Deploy User Status & SSH Key Setup

**Status**: **[NOT CONFIGURED] & [REQUIRES USER ACTION]**

### Live Verification Check:
```bash
$ id deploy; groups deploy; getent passwd deploy; ls -ld /home/deploy; ls -ld /var/www/beattend
id: 'deploy': no such user
groups: 'deploy': no such user
ls: cannot access '/home/deploy': No such file or directory
ls: cannot access '/var/www/beattend': No such file or directory
```

### SSH Key Setup Instructions for Mac Terminal:

1. **Mac SSH Public Key**:
   ```text
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICY5nsgTTWrJhUZydBXySDgjkmgjtwOpI9afc0Vp9N08 beattend-vps
   ```

2. **Creation Script to be executed on VPS**:
   ```bash
   sudo useradd -m -s /bin/bash -g www-data deploy
   sudo mkdir -p /home/deploy/.ssh
   sudo chmod 700 /home/deploy/.ssh
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICY5nsgTTWrJhUZydBXySDgjkmgjtwOpI9afc0Vp9N08 beattend-vps" | sudo tee /home/deploy/.ssh/authorized_keys
   sudo chmod 600 /home/deploy/.ssh/authorized_keys
   sudo chown -R deploy:www-data /home/deploy
   ```

3. **Verify SSH Access from Mac**:
   ```bash
   ssh deploy@76.13.253.114
   ```

---

## STEP 3: Live File System & Path Inventory

**Status**: **[NOT CONFIGURED]**

- `/var/www` -> `No such file or directory`
- `/var/www/beattend` -> `No such file or directory`
- **Active Frontend Path**: Pending installation & deployment to `/var/www/beattend/dist`.
- **Node.js Backend Path**: Pending deployment to `/var/www/beattend/server.ts`.
- **PHP API Path**: Pending deployment to `/var/www/beattend/time_attendance/database/php_api`.
- **Uploads Path**: Pending creation of `/var/www/beattend/storage/uploads`.
- **Logs Path**: Pending creation of `/var/log/beattend`.
- **Backups Path**: Pending creation of `/var/backups/beattend`.

---

## STEP 4: Live Nginx Configuration Status

**Status**: **[NOT CONFIGURED]**

```bash
$ nginx -v
bash: line 1: nginx: command not found
```

Nginx web server is not installed on the live VPS yet. The template `/deploy/nginx.conf` prepared in GitHub repository is ready for installation during Phase 2.

---

## STEP 5: Live PM2 & Process Manager Status

**Status**: **[NOT CONFIGURED]**

```bash
$ node -v; pm2 -v
bash: line 1: node: command not found
bash: line 1: pm2: command not found
```

Node.js and PM2 cluster manager are not installed on the live VPS yet. Template `/deploy/ecosystem.config.js` is ready for deployment.

---

## STEP 6: Live Git Repository & Commit Comparison

**Status**: **[LIVE VERIFIED]**

| Component / Property | GitHub Repository (`main` branch) | Live Hostinger VPS (`76.13.253.114`) | Comparison Finding |
| :--- | :--- | :--- | :--- |
| **Git Remote** | `https://github.com/belalBH/beattend-backend.git` | Not Cloned Yet | VPS needs `git clone` |
| **Latest Commit Hash** | `37a223c` | None | VPS is 0/20 commits behind |
| **Royal Olive & Gold Theme**| `6bdf4e6` | None | Ready to pull |
| **Compiled `dist/` Bundle** | `671e427` | None | Ready to pull |

---

## STEP 7: Live Services, Firewall & Network Port Bindings

**Status**: **[LIVE VERIFIED]**

### Command Output (`ss -tulpn` & `ufw status`):
```bash
$ ufw status
Status: inactive

$ ss -tulpn
tcp   LISTEN 0 4096 0.0.0.0:22   0.0.0.0:*  users:(("sshd",pid=54907,fd=3))
tcp   LISTEN 0 4096    [::]:22      [::]:*  users:(("sshd",pid=54907,fd=4))
```

- **Port 22 (SSH)**: Listening publicly on `0.0.0.0:22` & `[::]:22`.
- **Ports 80 & 443**: Not listening (Nginx not yet installed).
- **Ports 3000 & 8080**: Not listening (Node & PHP not yet installed).
- **Firewall (UFW)**: Currently `inactive`.

---

## STEP 8: Live Database Services Audit

**Status**: **[LIVE VERIFIED] & [NOT CONFIGURED]**

```bash
$ mysql --version; php -v
bash: line 1: mysql: command not found
bash: line 1: php: command not found
```

- **Live SQL Services**: MySQL / MariaDB / PHP are not yet installed on the VPS.
- **Firebase Cloud Database**: Primary cloud database used by Flutter mobile app (`crystal_hr`) and Node backend (`server.ts`).

---

## STEP 9: Live Backup Status

**Status**: **[NOT CONFIGURED]**

- `/var/backups/beattend` -> Not created yet.
- Crontab -> No backup cron jobs currently running.
- Backup script -> `deploy/backup.sh` ready in GitHub repository.

---

## Summary Table of Verified Items

| Item | Empirical Status Label |
| :--- | :--- |
| **1. SSH Access Status** | **[LIVE VERIFIED - SUCCESSFUL ROOT AUTHENTICATION]** |
| **2. Active Production Path** | **[NOT CONFIGURED]** (Pending `/var/www/beattend`) |
| **3. Active Git Commit** | `37a223c` on GitHub (`belalBH/beattend-backend`) |
| **4. Nginx Document Root** | **[NOT CONFIGURED]** (Pending `/deploy/nginx.conf` setup) |
| **5. Running PM2 Command** | **[NOT CONFIGURED]** (Pending Node.js & PM2 installation) |
| **6. Active Database Engine** | **Firebase Firestore** (Mobile Primary Cloud Engine) |
| **7. Backup Status** | **[NOT CONFIGURED]** (Pending `deploy/backup.sh` setup) |
| **8. GitHub vs VPS Differences** | VPS is a clean Ubuntu 24.04 LTS instance ready for Phase 2 installation. |
