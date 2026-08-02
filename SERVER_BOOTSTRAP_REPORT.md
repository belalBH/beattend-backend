# 🚀 Phase 2: Professional Server Bootstrap Report (`SERVER_BOOTSTRAP_REPORT.md`)

**Server Target**: Hostinger VPS (`srv1834150.hstgr.cloud`)  
**Public IPv4**: `76.13.253.114`  
**Public IPv6**: `2a02:4780:f:797b::1`  
**Phase Status**: **`[BOOTSTRAP COMPLETED SUCCESSFULLY]`**  
**Configured Timezone**: `Asia/Riyadh` (+0300)  
**Bootstrap Timestamp**: August 3, 2026 01:08 AM AST  

---

## Executive Summary

Phase 2 (Server Bootstrap) has been completed on Hostinger VPS `76.13.253.114` adhering to enterprise production standards.

- **Operating System**: **Ubuntu 24.04.4 LTS (Noble Numbat)** updated with latest security packages.
- **Runtimes Installed**: **Node.js v22.23.2 LTS**, **PHP 8.3.6 (FPM & CLI)**, **Composer v2.7.1**.
- **Process Manager**: **PM2 v7.0.3** configured with systemd auto-boot service (`pm2-deploy.service`).
- **Web & Proxy Server**: **Nginx 1.24.0** enabled with systemd startup.
- **Databases & Cache**: **MariaDB 10.11.14** and **Redis 7.0.15** initialized and enabled.
- **Security & Firewall**: **UFW Firewall** enabled (`22/tcp`, `80/tcp`, `443/tcp` allowed) and **Fail2Ban** active protecting SSH.
- **Deployment User**: Dedicated non-root **`deploy`** user created with SSH public-key authentication and group ownership (`www-data`).
- **Directory Hierarchy**: Production structure created at `/var/www/beattend/` with strict permissions.

> **Strict Phase 2 Compliance**: No GitHub repositories were cloned, no production code was deployed, no Nginx virtual hosts were created, no SSL certificates requested, and no production databases created.

---

## 1. Installed Software & Component Versions

| Package / Software | Installed Version | Systemd Service Status |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 24.04.4 LTS (Noble Numbat) | Active (Kernel `6.8.0-134-generic`) |
| **Git** | `v2.43.0` | Installed |
| **Node.js** | `v22.23.2` (NodeSource LTS) | Active Runtime |
| **NPM** | `v10.9.8` | Installed |
| **PM2 Process Manager** | `v7.0.3` | Active (`pm2-deploy.service` enabled) |
| **Nginx Web Server** | `v1.24.0` (Ubuntu) | Active (`nginx.service` enabled) |
| **PHP Engine** | `PHP 8.3.6` (CLI & FPM) | Active (`php8.3-fpm.service` enabled) |
| **Composer** | `v2.7.1` | Installed |
| **MariaDB Database** | `v10.11.14-MariaDB` | Active (`mariadb.service` enabled) |
| **Redis Cache Server** | `v7.0.15` | Active (`redis-server.service` enabled) |
| **Certbot SSL** | `v2.9.0` (Python3 Nginx Plugin) | Active (`certbot.timer` enabled) |
| **UFW Firewall** | Uncomplicated Firewall | Active (`22`, `80`, `443` open) |
| **Fail2Ban Security** | `v1.0.2` | Active (`fail2ban.service` SSH jail) |
| **Build Tools** | `build-essential`, `unzip`, `curl` | Installed |

---

## 2. Server Resource Metrics & Performance

| Hardware Resource | Metric Value | System Details |
| :--- | :--- | :--- |
| **Timezone** | `Asia/Riyadh` (+03, +0300) | Clock synchronized via NTP |
| **CPU Processor** | 2 vCPUs | AMD EPYC 9354P 32-Core Processor @ 2.0GHz |
| **Total Memory (RAM)** | 8.0 GB (7940 MB) | 667 MB used, 7273 MB available |
| **Disk Storage** | 96 GB NVMe SSD | 2.3 GB used, 94 GB available (3% utilization) |

---

## 3. Deployment User Configuration (`deploy`)

- **User**: `deploy`
- **UID / GID**: `1000` / `33` (`www-data`)
- **Home Directory**: `/home/deploy`
- **Shell**: `/bin/bash`
- **Group Membership**: `www-data`
- **SSH Key Configured**: `/home/deploy/.ssh/authorized_keys` (`chmod 600`)
- **Configured Public Key**:
  ```text
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICY5nsgTTWrJhUZydBXySDgjkmgjtwOpI9afc0Vp9N08 beattend-vps
  ```

---

## 4. Directory Hierarchy & Permission Verification

Root Path: `/var/www/beattend`  
Ownership: `deploy:www-data`  
Directory Permissions: `775` (`drwxrwxr-x`)  

```
/var/www/beattend/
├── frontend/             [deploy:www-data 775]
├── backend/              [deploy:www-data 775]
├── php-api/              [deploy:www-data 775]
├── storage/              [deploy:www-data 775]
│   ├── uploads/          [deploy:www-data 775]
│   ├── documents/        [deploy:www-data 775]
│   └── temp/             [deploy:www-data 775]
├── logs/                 [deploy:www-data 775]
├── backups/              [deploy:www-data 775]
├── scripts/              [deploy:www-data 775]
└── releases/             [deploy:www-data 775]
```

### System System Logs & Backup Paths:
- `/var/log/beattend/` -> `deploy:www-data` (`775`)
- `/var/backups/beattend/` -> `deploy:www-data` (`775`)

---

## 5. Security & Firewall Rules (UFW & Fail2Ban)

### UFW Rules Active:
```text
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere                  
80/tcp                     ALLOW       Anywhere                  
443/tcp                    ALLOW       Anywhere                  
22/tcp (v6)                ALLOW       Anywhere (v6)             
80/tcp (v6)                ALLOW       Anywhere (v6)             
443/tcp (v6)               ALLOW       Anywhere (v6)             
```

### Fail2Ban Jail Status:
- `sshd` jail is active protecting port 22 against brute-force intrusion attempts.

---

## NEXT STEPS & APPROVAL REQUIREMENT

Phase 2 (Server Bootstrap) is complete and verified.

We are stopped and awaiting your explicit review and approval before proceeding to **Phase 3 (Source Code & Repository Deployment Verification)**.
