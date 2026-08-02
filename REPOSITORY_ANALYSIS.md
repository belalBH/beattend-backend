# 📦 Phase 3: Repository Analysis Report (`REPOSITORY_ANALYSIS.md`)

**Repository**: `https://github.com/belalBH/beattend-backend.git`  
**Default Branch**: `main`  
**Latest Commit Hash**: `edf6c96`  
**Phase Status**: **`[REPOSITORY VERIFIED & DEPLOYMENT READY]`**  

---

## 1. Component Separation & Production Path Mapping

| Component Name | Source Code Path | Target Production Location on VPS | Responsibility |
| :--- | :--- | :--- | :--- |
| **React Web Frontend** | `src/`, `index.html`, `vite.config.ts` | `/var/www/beattend/frontend` | Single Page Web App (SPA) served via Nginx `dist/` |
| **Node.js Express Backend** | `server.ts`, `package.json` | `/var/www/beattend/backend` | API Gateway & Firebase Admin proxy (port 3000) |
| **PHP REST API Engine** | `time_attendance/database/php_api/` | `/var/www/beattend/php-api` | Multi-tenant PDO REST API engine |
| **Executive Web Dashboard**| `web_dashboard/` | `/var/www/beattend/web_dashboard` | Standalone HTML/CSS/JS Executive Dashboard |
| **Flutter Mobile App** | `crystal_hr/` & `time_attendance/` | Client Mobile Device (iOS/Android) | Mobile app communicating with API gateway |
| **Storage & Uploads** | N/A | `/var/www/beattend/storage/uploads` | User uploaded documents & media |
| **Logs & Backups** | N/A | `/var/log/beattend`, `/var/backups/beattend` | PM2 logs and database backup archives |

---

## 2. Component Build & Execution Specifications

### A. React Frontend (`frontend/`)
- **Install Command**: `npm ci`
- **Build Command**: `npm run build` (Outputs to `/var/www/beattend/frontend/dist`)
- **Serving Engine**: Nginx static file server (`try_files $uri $uri/ /index.html;`)

### B. Node.js Backend (`backend/`)
- **Install Command**: `npm ci`
- **Build Command**: `npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs`
- **Execution Command**: `pm2 start deploy/ecosystem.config.js --env production` (Port 3000)

### C. PHP REST API Engine (`php-api/`)
- **Install Command**: `composer install --no-dev --optimize-autoloader`
- **Execution Engine**: PHP 8.3 FPM socket (`unix:/var/run/php/php8.3-fpm.sock`) via Nginx FastCGI

---

## 3. Production Environment Variables Audit

| Environment Variable | Category | Required in Prod? | Exists in `.env`? | Safety & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | System | **YES** | Configured (`production`) | Enforces production optimization |
| `PORT` | Network | **YES** | Configured (`3000`) | Node.js internal loopback port |
| `APP_URL` | Domain | **YES** | Configured (`https://beattend.com`) | Public platform URL |
| `API_URL` | Domain | **YES** | Configured (`https://beattend.com/api`) | Primary API gateway endpoint |
| `JWT_SECRET` | Security | **YES** | Configured | Secret key for auth tokens |
| `DB_HOST` | Database | **YES** | Configured (`127.0.0.1`) | MariaDB database server host |
| `DB_PORT` | Database | **YES** | Configured (`3306`) | MariaDB database port |
| `DB_NAME` | Database | **YES** | Configured (`time_attendance_db`) | Primary SQL database name |
| `DB_USER` | Database | **YES** | Configured (`beattend_user`) | MariaDB user account |
| `DB_PASSWORD` | Database | **YES** | Configured | Secret database password |
| `FIREBASE_PROJECT_ID` | Cloud | **YES** | Configured | Firebase project identifier |
| `FIREBASE_CLIENT_EMAIL`| Cloud | **YES** | Configured | Service account email |
| `FIREBASE_PRIVATE_KEY` | Cloud | **YES** | Configured | Firebase Admin RSA Private Key |

---

## 4. Generated Artifacts & Git Exclusion Rules

- **`node_modules/`**: Never committed to Git. Installed fresh via `npm ci`.
- **`vendor/`**: Never committed to Git. Installed fresh via `composer install`.
- **`dist/`**: Compiled on the server during deployment (`npm run build`).

---

## 5. Potential Failure Risk Detection & Mitigation

1. **Risk: Uncompiled TypeScript files in production**.
   - **Mitigation**: Esbuild compiles `server.ts` into a lightweight CJS bundle `dist/server.cjs` during deployment.
2. **Risk: Missing database tables on clean MariaDB installation**.
   - **Mitigation**: Automated migration script imports `time_attendance/database/time_attendance_mysql.sql` upon initial database creation.
3. **Risk: Permission errors when writing user uploads**.
   - **Mitigation**: Set `chmod -R 775 /var/www/beattend/storage` with ownership `deploy:www-data`.
