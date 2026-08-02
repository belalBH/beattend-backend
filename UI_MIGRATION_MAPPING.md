# 🗺️ UI Migration Mapping Specification (`UI_MIGRATION_MAPPING.md`)

**Migration Strategy**: Non-Destructive UI Component Wrapper  
**Rule**: Preserve 100% of underlying API endpoints, database structures, and Flutter mobile app contracts while upgrading to the approved Royal Olive Green & Gold Executive UI/UX.

---

## Page-by-Page Migration Mapping (29 Modules)

### 1. Executive Dashboard (`/?page=dashboard`)
- **Preserve**: Real-time stats API `GET /api/dashboard/stats`, MariaDB queries for active employees, present counts, and leave counters.
- **Apply New UI**: Royal Olive Green metric cards, gold icon accents, glassmorphic layout, AI Sentiment Analysis modal trigger button.
- **Mobile Impact**: None (Web dashboard presentation only).

### 2. Employee Directory & Management (`/?page=employees`)
- **Preserve**: Employee CRUD APIs (`GET/POST/PUT/DELETE /php_api/api.php?route=employees`), pagination, search filters, department assignments, and Flutter user ID mapping.
- **Apply New UI**: Olive green data tables, status badges, custom action dropdowns, gold add-employee modal form.
- **Mobile Impact**: Zero API signature changes. `crystal_hr` mobile app login and profile sync remain untouched.

### 3. Attendance Monitoring & Logs (`/?page=attendance`)
- **Preserve**: Check-in/check-out session logs API (`GET /php_api/api.php?route=attendance`), geofence verification logic, work hour calculations, and mobile GPS check-in triggers.
- **Apply New UI**: Modern attendance table with status pill badges (Present, Late, Absent), live search, and filter by branch.
- **Mobile Impact**: Mobile check-in API contracts (`POST /api/check-in`) remain 100% identical.

### 4. Geofencing & Work Locations (`/?page=locations`)
- **Preserve**: Branch latitude/longitude, radius distance validation in meters, map coordinates, and mobile location checks.
- **Apply New UI**: Location cards with embedded maps preview, gold branch distance pills, and location add/edit modals.
- **Mobile Impact**: Mobile app geofence radius check retains exact lat/lng JSON parameters.

### 5. Leave Requests & Approvals (`/?page=leaves`)
- **Preserve**: Leave balance calculation, multi-level approval workflows, leave type rules, and MariaDB `leave_requests` table updates.
- **Apply New UI**: Dual view (Leave Balances summary + Pending Approval requests), gold action buttons (Approve/Reject), and status indicators.
- **Mobile Impact**: `crystal_hr` mobile leave submission API contracts remain identical.

### 6. Payroll & Payslips (`/?page=payroll`)
- **Preserve**: Basic salary, allowance calculations, deduction rules, payslip PDF generation, and `payroll_runs` DB transactions.
- **Apply New UI**: Financial overview cards, payroll table, payslip modal preview with gold print/download controls.
- **Mobile Impact**: Mobile payslip viewing API contracts remain 100% compatible.

### 7. Document Management (`/?page=documents`)
- **Preserve**: File upload paths (`/var/www/beattend/shared/documents`), file type validation, document metadata in `employee_documents` table.
- **Apply New UI**: Grid/list document view cards with file type icons, upload drag-and-drop modal, and document expiry badges.
- **Mobile Impact**: Mobile document viewing APIs remain compatible.
