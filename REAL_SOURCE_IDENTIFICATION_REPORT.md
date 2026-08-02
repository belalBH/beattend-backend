# 🏛️ Real Source Identification Report (`REAL_SOURCE_IDENTIFICATION_REPORT.md`)

**Target Domain**: `beattend.com` (Live Production System)  
**Approved VPS Design Reference**: `http://76.13.253.114`  
**Mobile App Codebases**: `crystal_hr` & `time_attendance`  
**Migration Mode**: **UI/UX Visual Redesign (Non-Destructive Logic Preservation)**  

---

## 1. Approved VPS Visual Design Identification

The approved visual design (Royal Olive Green `#1b3325` / `#234735` & Gold `#d4af37` theme, Arabic RTL, modern executive sidebar, cards, and typography) is located in:

- **Repository**: `https://github.com/belalBH/beattend-backend.git`
- **Branch**: `main`
- **Latest Commit**: `059116b`
- **Primary Source Files**:
  - `src/App.tsx`: Full executive UI components, tabs, search, cards, tables, and modal structures.
  - `src/index.css`: Design system CSS variables, HSL color tokens, typography (`Inter`/`Tajawal`), RTL flexbox layouts, glassmorphism, and responsive utilities.
  - `web_dashboard/index.html` & `web_dashboard/css/style.css`: Standalone executive web dashboard styling.
  - `package.json`: Vite + Tailwind CSS build pipeline.

---

## 2. Complete Existing System Identification (`beattend.com`)

The complete production system powering `https://beattend.com` and its associated mobile backends:

- **Primary Repository**: `belalBH/beattend-backend` & `time_attendance`
- **Frontend SPA**: React 19 SPA (`src/`) & Executive Web Dashboard (`web_dashboard/`)
- **Backend API Engines**:
  - Express.js Gateway (`server.ts` / `backend-dist/server.cjs`) on Port 3000.
  - Native PHP REST API (`php_api/api.php`) on PHP 8.3 FPM (`/var/run/php/php8.3-fpm.sock`).
- **Databases**:
  - MariaDB 10.11 (`beattend_db`): Authoritative relational database for Companies, Employees, Attendance, Payroll, Documents, and Roles.
  - Firebase Firestore & Auth: Authentication credentials, real-time mobile check-in event triggers, and FCM device tokens.
- **Mobile Applications**:
  - `crystal_hr` (Flutter Android/iOS app).
  - `time_attendance` (Flutter Android/iOS app).

---

## 3. Preservation & Non-Interference Guarantees

1. **DNS Protection**: Domain `beattend.com` will NOT be repointed until staging validation is 100% complete.
2. **Mobile App Compatibility**: All Flutter API endpoints (`/api/check-in`, `/api/check-out`, `/api/device-token`, `/php_api/api.php`) retain 100% exact JSON parameter and response signatures.
3. **Database Security**: Zero DDL drops, zero table removals, and zero column alterations on production database `beattend_db`.
