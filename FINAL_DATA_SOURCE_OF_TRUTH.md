# 📊 Final Data Source of Truth Specification (`FINAL_DATA_SOURCE_OF_TRUTH.md`)

**Server Target**: Hostinger VPS (`76.13.253.114`)  
**SQL Database**: MariaDB 10.11 (`beattend_db`)  
**Auth Engine**: Firebase Auth  
**Push Engine**: Firebase Cloud Messaging (FCM)  
**Verification Status**: **`[VERIFIED - MASTER DATA ARCHITECTURE]`**  

---

## 1. Production Data Mapping Matrix

| Module | Authoritative Source of Truth | Read Access | Write Access | SQLite Status |
| :--- | :--- | :--- | :--- | :--- |
| **Companies** | **MariaDB (`beattend_db.companies`)** | PHP / Node REST API | Web Admin | **Removed from Prod** |
| **Employees** | **MariaDB (`beattend_db.employees`)** | PHP / Node REST API | Web Admin | **Removed from Prod** |
| **Attendance** | **MariaDB (`beattend_db.attendance_sessions`)**| PHP / Node REST API | Mobile / Web | **Removed from Prod** |
| **Leave Requests** | **MariaDB (`beattend_db.leave_requests`)** | PHP / Node REST API | Mobile / Web | **Removed from Prod** |
| **Payroll** | **MariaDB (`beattend_db.payroll_summary`)**| PHP REST API | Web Admin | **Removed from Prod** |
| **Document Metadata** | **MariaDB (`beattend_db.employee_documents`)**| PHP REST API | Web Admin | **Removed from Prod** |
| **Actual Document Files**| **Shared File Storage (`shared/documents/`)**| Web / Nginx | Web Admin | **Shared Local Storage** |
| **Authentication** | **Firebase Auth (Credentials)** + **MariaDB (`users` Profiles)** | Auth Middleware | Signup / Profile Update| **Hybrid Security** |
| **Device Tokens** | **MariaDB (`beattend_db.device_tokens`)**| Node FCM Service | Mobile App | **Relational Registry** |
| **Push Notifications** | **Firebase FCM (Delivery Service Only)** | Mobile App Listener | Node FCM Admin | **Notification Gateway** |

---

## 2. Authentication Security Architecture

- **Firebase Auth**: Authoritative for user credentials, email verification, and OAuth tokens. Passwords are **never stored** in MariaDB.
- **MariaDB `users` Table**: Stores profile metadata, `tenant_id`, `role`, `status`, and `firebase_uid`.
- **FCM**: Serves purely as a push message transport system; device token registry is stored in MariaDB.
