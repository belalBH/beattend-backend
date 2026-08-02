# 📋 Complete Feature Inventory (`COMPLETE_FEATURE_INVENTORY.md`)

**System Scope**: Complete BeatAttend HR Enterprise Platform  
**Target Migration**: Royal Olive Green & Gold Executive UI/UX Redesign  

---

## Complete Functional Module Inventory (29 Modules)

| Module Name | Frontend View / Route | Primary API Endpoint | Database Table / Firebase | Mobile App (`crystal_hr`) Dependency |
| :--- | :--- | :--- | :--- | :--- |
| **1. Executive Dashboard** | `/?page=dashboard` | `GET /api/dashboard/stats` | `attendance_sessions`, `employees` | Low |
| **2. Multi-Tenant Management**| `/?page=tenants` | `GET /php_api/api.php?route=tenants` | `tenants` table | High (Tenant Header) |
| **3. Companies & Subsidiaries** | `/?page=companies` | `GET /php_api/api.php?route=companies`| `companies` table | High |
| **4. Branches & Locations** | `/?page=locations` | `GET /php_api/api.php?route=branches` | `branches` table | High (GPS Coordinates) |
| **5. Departments** | `/?page=departments` | `GET /php_api/api.php?route=departments` | `departments` table | Medium |
| **6. Employee Directory** | `/?page=employees` | `GET /php_api/api.php?route=employees` | `employees`, `users` tables | High |
| **7. Employee Onboarding** | `/?page=employees#add` | `POST /php_api/api.php?route=employees`| `employees` table | Low |
| **8. Attendance Monitoring** | `/?page=attendance` | `GET /php_api/api.php?route=attendance` | `attendance_sessions` | High (Check-In Log) |
| **9. Geofencing Enforcement** | `/?page=geofences` | `GET /api/geofences` | `geofences`, `branches` | High (GPS Radius Check) |
| **10. Attendance Corrections** | `/?page=corrections` | `POST /php_api/api.php?route=corrections`| `attendance_corrections` | High |
| **11. Work Shifts & Schedules** | `/?page=shifts` | `GET /api/shifts` | `work_schedules` | High |
| **12. Leave Types & Rules** | `/?page=leave_types` | `GET /php_api/api.php?route=leave_types`| `leave_types` table | Medium |
| **13. Leave Balances** | `/?page=leaves#balances`| `GET /php_api/api.php?route=leave_balance`| `leave_requests` table | High |
| **14. Leave Requests** | `/?page=leaves` | `POST /php_api/api.php?route=leaves` | `leave_requests` table | High |
| **15. Multi-Level Approvals**| `/?page=approvals` | `POST /php_api/api.php?route=approvals` | `leave_approvals` table | High |
| **16. Payroll Processing** | `/?page=payroll` | `GET /php_api/api.php?route=payroll` | `payroll_runs` table | Low |
| **17. Payslips Generation** | `/?page=payslips` | `GET /php_api/api.php?route=payslips` | `payslips` table | High (View Payslip) |
| **18. Allowances & Deductions** | `/?page=payroll#adjustments`| `POST /api/payroll/adjustments` | `payroll_allowances`, `payroll_deductions` | Low |
| **19. Document Management** | `/?page=documents` | `GET /php_api/api.php?route=documents` | `employee_documents`, `shared/documents` | Medium |
| **20. Official Calendar** | `/?page=calendar` | `GET /api/calendar` | `calendar_events` table | Medium |
| **21. Public Holidays** | `/?page=holidays` | `GET /api/holidays` | `official_holidays` table | High |
| **22. Push Notifications** | `/?page=notifications` | `POST /api/notifications/send` | `notifications`, `device_tokens`, FCM | High (FCM Listener) |
| **23. Roles & Permissions** | `/?page=roles` | `GET /api/roles` | `roles`, `permissions`, `role_permissions` | High |
| **24. Device Token Registry**| `/?page=devices` | `POST /api/device-token` | `device_tokens`, `devices` | High (UDID Verification) |
| **25. Audit Logs** | `/?page=audit` | `GET /api/audit-logs` | `audit_logs` table | Low |
| **26. AI Sentiment Reports** | Modal Trigger | `POST /api/sentiment-analysis` | Gemini 3.5 API | Low |
| **27. System Settings** | `/?page=settings` | `GET /api/settings` | `system_settings` table | Low |
| **28. Firebase Auth Sync** | Internal Auth | Firebase Admin SDK | Firebase Auth & `users` | High (JWT Bearer Token) |
| **29. Standalone Dashboard** | `/web_dashboard/` | Direct Asset Server | Static Assets / API Proxy | Low |
