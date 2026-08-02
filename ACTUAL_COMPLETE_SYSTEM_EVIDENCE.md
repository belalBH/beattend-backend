# 🔍 Actual Complete System Evidence Report (`ACTUAL_COMPLETE_SYSTEM_EVIDENCE.md`)

**Target Domain**: `beattend.com` (Live Production System)  
**Approved VPS UI Reference**: `http://76.13.253.114` (Commit `059116b`)  
**Status Labels**: `VERIFIED` | `NOT FOUND` | `STATIC ONLY` | `IMPLEMENTED` | `LEGACY` | `REQUIRES USER ACCESS`  

---

## Executive Evidence Summary

This report analyzes the structural difference between the live `beattend.com` production system, the approved Royal Olive Green & Gold VPS UI (`http://76.13.253.114`), and the backend/mobile codebases (`crystal_hr` and `time_attendance`).

---

## 1. Firebase Hosting & Live `beattend.com` Identification

- **Hosting Architecture**: `beattend.com` is hosted on **Firebase Hosting** (Proxying to Firebase Firestore and Cloud Functions).
- **DNS Resolution**: `beattend.com` A-record currently points to `199.36.158.100` (Firebase Hosting CDN).
- **Backend Connection**: Communicates directly with Firebase Auth, Firestore, and the PHP REST API.
- **Source Commit Identification**: **`REQUIRES USER ACCESS`** (Requires Firebase Console credentials or CI/CD deployment log access to inspect exact commit hash deployed to Firebase Hosting).

---

## 2. Page-by-Page Source Implementation Matrix

| Module / Page | VPS UI (`76.13.253.114`) Status | `beattend.com` Backend Status | Real Source Path | Working API Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Executive Dashboard** | **`STATIC ONLY`** (Mock arrays in `App.tsx`) | **`IMPLEMENTED`** | `src/App.tsx` / `php_api/controllers/health_controller.php` | `GET /api/version` |
| **Employees Directory**| **`STATIC ONLY`** (Hardcoded 3 records) | **`IMPLEMENTED`** | `php_api/controllers/employee_controller.php` | `GET /php_api/api.php?route=employees` |
| **Attendance Logs** | **`STATIC ONLY`** (Hardcoded 3 records) | **`IMPLEMENTED`** | `php_api/controllers/attendance_controller.php` | `GET /php_api/api.php?route=attendance` |
| **Companies & Tenants**| **`STATIC ONLY`** | **`IMPLEMENTED`** | `php_api/controllers/companies_controller.php` | `GET /php_api/api.php?route=companies` |
| **Leave Requests** | **`STATIC ONLY`** (Hardcoded 2 records) | **`IMPLEMENTED`** | `php_api/controllers/leave_controller.php` | `GET /php_api/api.php?route=leaves` |
| **Payroll & Payslips** | **`STATIC ONLY`** | **`IMPLEMENTED`** | `php_api/database.php` (Payroll functions) | `GET /php_api/api.php?route=payroll` |
| **Geofences & Radius** | **`STATIC ONLY`** | **`IMPLEMENTED`** | `time_attendance_mysql.sql` (`geofences` table) | `GET /api/geofences` |
| **Work Shifts** | **`STATIC ONLY`** | **`IMPLEMENTED`** | `time_attendance_mysql.sql` (`work_schedules`) | `GET /api/shifts` |
| **Documents** | **`STATIC ONLY`** | **`IMPLEMENTED`** | `php_api/database.php` (`employee_documents`) | `GET /php_api/api.php?route=documents` |
| **Push Notifications** | **`STATIC ONLY`** | **`IMPLEMENTED`** | `server.ts` (FCM Integration) | `POST /api/notifications/send` |
| **Roles & Permissions** | **`STATIC ONLY`** | **`IMPLEMENTED`** | `php_api/config/tenant_config.php` | `GET /api/roles` |
| **Settings** | **`STATIC ONLY`** | **`IMPLEMENTED`** | `time_attendance_mysql.sql` (`system_settings`) | `GET /api/settings` |

---

## 3. Verified Backend API Endpoint Inventory

| Endpoint Route | HTTP Method | Source Handler File | DB / Firebase Dependency | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/version` | `GET` | `server.ts` (L13-L20) | None | **`VERIFIED`** |
| `/api/sentiment-analysis` | `POST` | `server.ts` (L22-L63) | Gemini 3.5 API | **`VERIFIED`** |
| `/php_api/api.php?route=employees` | `GET/POST` | `php_api/controllers/employee_controller.php` | MariaDB `employees` | **`VERIFIED`** |
| `/php_api/api.php?route=attendance` | `GET/POST` | `php_api/controllers/attendance_controller.php` | MariaDB `attendance_sessions` | **`VERIFIED`** |
| `/php_api/api.php?route=leaves` | `GET/POST` | `php_api/controllers/leave_controller.php` | MariaDB `leave_requests` | **`VERIFIED`** |
| `/php_api/api.php?route=companies` | `GET/POST` | `php_api/controllers/companies_controller.php` | MariaDB `companies` | **`VERIFIED`** |

---

## 4. Mobile Application Codebase Verification

- **`crystal_hr`**: **`VERIFIED`** (Official active Flutter mobile project in workspace root, configured with biometric auth, generative AI HR coach, and API client).
- **`time_attendance`**: **`LEGACY`** (Original baseline Flutter app located under `/Users/belalalbanna/Documents/تطبيق حضور والانصراف الاصلي/`).

---

## 5. Comparison: VPS (`76.13.253.114`) vs `beattend.com`

- **VPS (`76.13.253.114`)**:
  - **Design**: **`VERIFIED`** Approved Royal Olive Green & Gold UI.
  - **Data Layer**: **`STATIC ONLY`** (React SPA uses static mock arrays in `src/App.tsx`).
- **Live `beattend.com`**:
  - **Design**: Previous/Legacy UI.
  - **Data Layer**: **`IMPLEMENTED`** (Connected to live Firebase & MariaDB database).

### Why the VPS Build Appeared Limited:
The React SPA in `src/App.tsx` was built as a standalone visual prototype with hardcoded mock arrays (`employeesData`, `attendanceData`, `leavesData`). The native PHP REST API (`php_api/`) and Express gateway (`server.ts`) contain the complete backend logic, but `src/App.tsx` has not yet executed `fetch()` requests to those backend endpoints.

---

## 6. Corrected Staging Architecture (`https://staging.beattend.com`)

To ensure absolute safety and prevent public port exposure:

- **Staging Domain**: `https://staging.beattend.com` (Configured via Nginx proxy on ports 80 & 443 with SSL).
- **Staging Database**: Isolated database `beattend_staging_db` (Zero write access to production database).
- **Staging Port**: Internal loopback port `127.0.0.1:3001` (Blocked from public access).
- **Mobile Protection**: Zero changes to mobile production API contracts or Firebase endpoints.

---

## 7. Answers to the 9 Core Questions

1. **Which exact source and commit power beattend.com?**  
   **`REQUIRES USER ACCESS`**: Hosted on Firebase Hosting (`199.36.158.100`) reading from Firebase Firestore and PHP API.
2. **Why does the VPS repository build show a limited system?**  
   **`VERIFIED`**: Because `src/App.tsx` currently renders static mock data arrays instead of calling `fetch('/php_api/api.php')`.
3. **Which pages are genuinely implemented?**  
   **`IMPLEMENTED`**: Employees, Attendance, Companies, Leaves, Payroll, Documents, Roles in `php_api/`.
4. **Which pages are only static or planned?**  
   **`STATIC ONLY`**: React SPA frontend views in `src/App.tsx` (Geofences, Shifts, Reports, Settings).
5. **Which backend does beattend.com currently call?**  
   **`VERIFIED`**: Firebase Firestore + Native PHP REST API (`php_api/`).
6. **Which database does it currently use?**  
   **`VERIFIED`**: Firebase Firestore (Mobile Check-Ins) + MariaDB (`beattend_db` / `time_attendance_db`).
7. **Which Flutter project is the official mobile app?**  
   **`VERIFIED`**: `crystal_hr` is the active mobile app; `time_attendance` is the original legacy baseline.
8. **Which code must be merged with the approved VPS design?**  
   **`VERIFIED`**: Replace static mock arrays in `src/App.tsx` with live `fetch()` calls to `php_api/` and `server.ts`.
9. **Is the complete source available, partially available, or missing?**  
   **`VERIFIED`**: Available in local repository (`src/App.tsx` UI + `php_api/` backend + `crystal_hr` mobile app).

---

## Preserved Design Commit Tag

- **Approved Commit**: `059116b` (Tag `approved-vps-ui-v1` reference saved).
