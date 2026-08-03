-- =========================================================
-- Platform Super Admin vs Tenant RBAC Separation & Universal Workflow Engine
-- Target Database: beattend_staging_db
-- =========================================================

USE beattend_staging_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- PART 1: DEDICATED PLATFORM SUPER ADMIN SUBSYSTEM
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS platform_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(64) NULL,
  status ENUM('active', 'suspended', 'unverified') DEFAULT 'active',
  two_factor_secret VARCHAR(128) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(64) NOT NULL UNIQUE,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  name_ar VARCHAR(150) NOT NULL,
  module VARCHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES platform_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES platform_permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_user_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES platform_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform_user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NULL,
  details TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (platform_user_id) REFERENCES platform_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- PART 2: TENANT MASTER & MANY-TO-MANY ROLES SCHEMA
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(64) NULL,
  global_status ENUM('active', 'suspended', 'unverified') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenant_memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tenant_id VARCHAR(64) NOT NULL,
  employee_id INT NULL,
  status ENUM('pending', 'active', 'suspended', 'invited') DEFAULT 'active',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_tenant (user_id, tenant_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT NULL,
  is_default TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Many-to-Many Roles Assignment Table
CREATE TABLE IF NOT EXISTS membership_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membership_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_mem_role (membership_id, role_id),
  FOREIGN KEY (membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- PART 3: MODULAR EXTENSIBLE PERMISSION ARCHITECTURE
-- ---------------------------------------------------------

DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS permission_modules;

CREATE TABLE permission_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  icon VARCHAR(64) DEFAULT 'bi-gear',
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  code VARCHAR(128) NOT NULL UNIQUE,
  action_type ENUM('view','create','edit','delete','approve','reject','import','export','manage') NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  FOREIGN KEY (module_id) REFERENCES permission_modules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  UNIQUE KEY uk_role_perm (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- PART 4: DATA SCOPES & TENANT FEATURES
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_data_scopes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membership_id INT NOT NULL UNIQUE,
  scope_type ENUM('all_company', 'selected_branches', 'selected_departments', 'direct_reports', 'self_only') DEFAULT 'all_company',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_branch_access (
  membership_id INT NOT NULL,
  branch_id INT NOT NULL,
  PRIMARY KEY (membership_id, branch_id),
  FOREIGN KEY (membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_department_access (
  membership_id INT NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (membership_id, department_id),
  FOREIGN KEY (membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenant_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  feature_code VARCHAR(64) NOT NULL,
  is_enabled TINYINT(1) DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tenant_feature (tenant_id, feature_code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membership_id INT NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- PART 5: UNIVERSAL DYNAMIC APPROVAL WORKFLOW ENGINE
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS approval_workflows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  entity_type ENUM('leaves','attendance_correction','overtime','advances','payroll','custom') NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approval_workflow_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workflow_id INT NOT NULL,
  step_order INT NOT NULL,
  step_name_ar VARCHAR(100) NOT NULL,
  approver_type ENUM('direct_manager','department_head','role_based','specific_user') NOT NULL,
  approver_role_id INT NULL,
  approver_user_id INT NULL,
  FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approval_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  entity_type ENUM('leaves','attendance_correction','overtime','advances','payroll','custom') NOT NULL,
  entity_id INT NOT NULL,
  requester_membership_id INT NOT NULL,
  workflow_id INT NOT NULL,
  current_step_order INT DEFAULT 1,
  status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (requester_membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE,
  FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approval_request_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  step_id INT NOT NULL,
  action_by_membership_id INT NOT NULL,
  action ENUM('approved','rejected','returned') NOT NULL,
  comments TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES approval_workflow_steps(id) ON DELETE CASCADE,
  FOREIGN KEY (action_by_membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- SEED DATA & INITIALIZATION
-- ---------------------------------------------------------

-- 1. Seed Platform Super Admin User (Pass: SuperAdmin2026!)
INSERT INTO platform_users (id, email, password_hash, full_name, status) VALUES
(1, 'superadmin@beattend.com', '$2y$10$e.w2T6G5Nl0x2H1M2uN.u.H7x1v9z9y9z9y9z9y9z9y9z9y9z9y9z', 'Platform Super Admin', 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 2. Seed Permission Modules
INSERT INTO permission_modules (id, code, name_ar, name_en, icon, sort_order) VALUES
(1, 'employees', 'دليل الموظفين', 'Employees', 'bi-people', 1),
(2, 'leaves', 'الإجازات والطلبات', 'Leaves', 'bi-calendar-event', 2),
(3, 'attendance', 'الحضور والبصمة', 'Attendance', 'bi-clock-history', 3),
(4, 'reports', 'التقارير والإحصائيات', 'Reports', 'bi-bar-chart', 4),
(5, 'settings', 'إعدادات النظام والمستخدمين', 'Settings', 'bi-gear', 5),
(6, 'geofencing', 'النطاق الجغرافي', 'Geofencing', 'bi-geo-alt', 6),
(7, 'payroll', 'مسيرات الرواتب', 'Payroll', 'bi-cash-stack', 7),
(8, 'leave_types', 'أنواع وقواعد الإجازات', 'Leave Types', 'bi-card-checklist', 8);

-- 3. Seed Permissions
INSERT INTO permissions (id, module_id, code, action_type, name_ar, name_en) VALUES
-- Employees
(1, 1, 'employees.view', 'view', 'عرض الموظفين', 'View Employees'),
(2, 1, 'employees.create', 'create', 'إضافة موظف جديد', 'Create Employee'),
(3, 1, 'employees.edit', 'edit', 'تعديل بيانات موظف', 'Edit Employee'),
(4, 1, 'employees.delete', 'delete', 'حذف موظف', 'Delete Employee'),
(5, 1, 'employees.import', 'import', 'استيراد موظفين', 'Import Employees'),
(6, 1, 'employees.export', 'export', 'تصدير قائمة الموظفين', 'Export Employees'),
(7, 1, 'employees.manage', 'manage', 'إدارة الموظفين بالكامل', 'Manage Employees'),
-- Leaves
(8, 2, 'leaves.view', 'view', 'عرض طلبات الإجازات', 'View Leaves'),
(9, 2, 'leaves.create', 'create', 'تقديم طلب إجازة', 'Create Leave Request'),
(10, 2, 'leaves.edit', 'edit', 'تعديل طلب إجازة', 'Edit Leave Request'),
(11, 2, 'leaves.delete', 'delete', 'إلغاء طلب إجازة', 'Cancel Leave Request'),
(12, 2, 'leaves.approve', 'approve', 'اعتماد الإجازات', 'Approve Leaves'),
(13, 2, 'leaves.reject', 'reject', 'رفض طلبات الإجازات', 'Reject Leaves'),
-- Attendance
(14, 3, 'attendance.view', 'view', 'عرض سجلات الحضور', 'View Attendance'),
(15, 3, 'attendance.create', 'create', 'تسجيل حضور/انصراف يدوي', 'Create Attendance Log'),
(16, 3, 'attendance.edit', 'edit', 'تعديل وتصحيح بصمة', 'Correct Attendance'),
(17, 3, 'attendance.approve', 'approve', 'اعتماد تصحيح البصمات', 'Approve Attendance Correction'),
(18, 3, 'attendance.export', 'export', 'تصدير سجلات الحضور', 'Export Attendance'),
-- Reports
(19, 4, 'reports.view', 'view', 'استعراض التقارير', 'View Reports'),
(20, 4, 'reports.export', 'export', 'تصدير التقارير', 'Export Reports'),
-- Settings
(21, 5, 'settings.view', 'view', 'عرض الإعدادات', 'View Settings'),
(22, 5, 'settings.edit', 'edit', 'تعديل إعدادات المنشأة', 'Edit Settings'),
(23, 5, 'settings.manage', 'manage', 'إدارة المستخدمين والصلاحيات بالكامل', 'Manage Users & Roles'),
-- Geofencing
(24, 6, 'geofences.view', 'view', 'عرض النطاقات الجغرافية', 'View Geofences'),
(25, 6, 'geofences.create', 'create', 'إنشاء نطاق جغرافي', 'Create Geofence'),
(26, 6, 'geofences.edit', 'edit', 'تعديل نطاق جغرافي', 'Edit Geofence'),
(27, 6, 'geofences.delete', 'delete', 'حذف نطاق جغرافي', 'Delete Geofence'),
-- Payroll
(28, 7, 'payroll.view', 'view', 'استعراض مسيرات الرواتب', 'View Payroll'),
(29, 7, 'payroll.create', 'create', 'إنشاء مسير رواتب جديد', 'Create Payroll Run'),
(30, 7, 'payroll.approve', 'approve', 'اعتماد مسير الرواتب', 'Approve Payroll'),
(31, 7, 'payroll.export', 'export', 'تصدير قسائم الرواتب', 'Export Payroll'),
-- Leave Types
(32, 8, 'leave_types.view', 'view', 'عرض أنواع الإجازات', 'View Leave Types'),
(33, 8, 'leave_types.manage', 'manage', 'إدارة أنواع وقواعد الإجازات', 'Manage Leave Types');

-- 4. Seed Default 10 Roles
INSERT INTO roles (id, tenant_id, name_ar, name_en, description, is_default, is_active) VALUES
(1, NULL, 'Company Admin', 'Company Admin', 'مدير الشركة الفائق وله كافة الصلاحيات', 1, 1),
(2, NULL, 'HR Manager', 'HR Manager', 'مدير الموارد البشرية والشؤون الإدارية', 1, 1),
(3, NULL, 'Attendance Officer', 'Attendance Officer', 'مسؤول الحضور والبصمات', 1, 1),
(4, NULL, 'Leave Approver', 'Leave Approver', 'معتمد طلبات الإجازات', 1, 1),
(5, NULL, 'Payroll Officer', 'Payroll Officer', 'مسؤول مسيرات وكشوفات الرواتب', 1, 1),
(6, NULL, 'Reports Viewer', 'Reports Viewer', 'مستعرض التقارير والإحصائيات فقط', 1, 1),
(7, NULL, 'Geofence Manager', 'Geofence Manager', 'مدير النطاقات والمواقع الجغرافية', 1, 1),
(8, NULL, 'Department Manager', 'Department Manager', 'مدير القسم المباشر', 1, 1),
(9, NULL, 'Employee', 'Employee', 'موظف عادي - خدمة ذاتية', 1, 1),
(10, NULL, 'Read Only', 'Read Only', 'مستعرض فقط لجميع الوحدات بدون تعديل', 1, 1)
ON DUPLICATE KEY UPDATE name_ar=VALUES(name_ar);

-- 5. Seed Permissions to Default Roles
-- Role 1 (Company Admin) -> ALL Permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Role 2 (HR Manager) -> Employees, Leaves, Attendance, Reports
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE module_id IN (1, 2, 3, 4, 8);

-- Role 3 (Attendance Officer) -> Attendance & Geofencing
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE module_id IN (3, 6);

-- Role 4 (Leave Approver) -> Leaves Approve & View
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code IN ('leaves.view', 'leaves.approve', 'leaves.reject');

-- Role 5 (Payroll Officer) -> Payroll
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE module_id = 7;

-- 6. Seed Demo Tenants Feature Flags
INSERT IGNORE INTO tenant_features (tenant_id, feature_code, is_enabled) VALUES
('tenant-sol-102', 'employees', 1),
('tenant-sol-102', 'leaves', 1),
('tenant-sol-102', 'attendance', 1),
('tenant-sol-102', 'reports', 1),
('tenant-sol-102', 'settings', 1),
('tenant-sol-102', 'geofencing', 1),
('tenant-sol-102', 'payroll', 1);

SET FOREIGN_KEY_CHECKS = 1;
