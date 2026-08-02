USE beattend_db;

INSERT INTO tenants (id, name, domain) VALUES ('tenant-sol-102', 'Solutions Enterprise', 'solutions.sa') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO companies (id, tenant_id, name, name_ar) VALUES (1, 'tenant-sol-102', 'Solutions Co', 'شركة الحلول المتقدمة') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO departments (id, company_id, name, name_ar) VALUES (1, 1, 'IT Department', 'تقنية المعلومات') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO employees (id, tenant_id, company_id, department_id, employee_number, first_name, last_name, email) VALUES (1, 'tenant-sol-102', 1, 1, 'EMP-001', 'Belal', 'Albanna', 'b.albanna@hadiyah.org.sa') ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);
INSERT INTO attendance_sessions (id, tenant_id, employee_id, check_in, work_hours, status) VALUES (1, 'tenant-sol-102', 1, NOW(), 8.5, 'Present') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days_count, status, reason) VALUES (1, 1, 1, '2026-08-05', '2026-08-10', 5, 'Pending', 'Annual Leave') ON DUPLICATE KEY UPDATE status=VALUES(status);
