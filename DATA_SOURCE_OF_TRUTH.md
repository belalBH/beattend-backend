# 📊 Data Source of Truth Specification (`DATA_SOURCE_OF_TRUTH.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**SQL Database**: MariaDB 10.11 (`beattend_db`)  
**Cloud Engine**: Firebase Firestore & Auth  
**Verification Status**: **`[VERIFIED - MASTER DATA SOURCE MAPPING]`**  

---

## 1. Single Authoritative Source per Module

To eliminate data sync conflicts, each module is assigned exactly one authoritative source of truth.

| Module Name | Authoritative Source of Truth | Read Path | Write Path | SQLite Policy |
| :--- | :--- | :--- | :--- | :--- |
| **1. Companies** | **MariaDB (`beattend_db.companies`)** | PHP / Node REST API | Web Admin Dashboard | Removed from Prod |
| **2. Employees** | **MariaDB (`beattend_db.employees`)** | PHP / Node REST API | Web Admin Dashboard | Removed from Prod |
| **3. Attendance** | **Firebase Firestore (`attendance` Collection)** | Flutter Mobile App | Mobile Check-In Orb | Real-time Cloud |
| **4. Leave Requests** | **Firebase Firestore (`leave_requests` Collection)**| Flutter Mobile / Web | Mobile App / Web | Real-time Cloud |
| **5. Payroll** | **MariaDB (`beattend_db.payroll_summary`)** | PHP REST API | Web Admin Dashboard | Removed from Prod |
| **6. Documents** | **MariaDB (`beattend_db.employee_documents`)**| PHP REST API | Web Admin Dashboard | Removed from Prod |
| **7. Authentication** | **Firebase Auth + MariaDB (`users`)** | Auth Controller | Signup / User Creation| Unified Auth |
| **8. Notifications** | **Firebase FCM Tokens** | Mobile App Listener | Node.js FCM Admin | Real-time Push |

---

## 2. SQLite Database Production Removal Policy

- **Development Role**: SQLite (`time_attendance_sqlite.db`) is strictly designated for local developer offline testing.
- **Production Policy**: SQLite is **completely removed from production runtime**. All relational database queries execute against MariaDB 10.11 (`beattend_db`).
- **PM2 Scaling**: Removing SQLite enables PM2 to scale Node.js Express in multi-core cluster mode if needed without file locking risks.

---

## 3. Database Initialization & SQL Script Audit (`time_attendance_mysql.sql`)

### Safety Analysis of `time_attendance_mysql.sql`:
- **Line 12 Inspection**: Contains `DROP DATABASE IF EXISTS time_attendance_db; CREATE DATABASE time_attendance_db...`.
- **Destructive Danger**: Running this script raw would destroy existing database structures.
- **Production Guardrail**: The SQL file is updated to use `beattend_db` with `CREATE DATABASE IF NOT EXISTS beattend_db;` and executed strictly through controlled migrations after manual approval.
