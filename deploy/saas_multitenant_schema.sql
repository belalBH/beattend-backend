-- =========================================================
-- BeatAttend Enterprise Multi-Tenant SaaS DB Schema & Seeds
-- Environment: beattend_staging_db
-- =========================================================

USE beattend_staging_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tenants Table
DROP TABLE IF EXISTS tenants;
CREATE TABLE tenants (
  tenant_id VARCHAR(64) PRIMARY KEY,
  company_code VARCHAR(64) NOT NULL UNIQUE,
  slug VARCHAR(64) NOT NULL UNIQUE,
  subdomain VARCHAR(128) NOT NULL UNIQUE,
  custom_domain VARCHAR(128) NULL,
  status ENUM('active', 'suspended', 'expired') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Subscription Plans
DROP TABLE IF EXISTS subscription_plans;
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  max_admin_users INT NOT NULL DEFAULT 5,
  max_employees INT NOT NULL DEFAULT 50,
  max_branches INT NOT NULL DEFAULT 3,
  max_storage_mb INT NOT NULL DEFAULT 5000,
  geofencing_enabled TINYINT(1) DEFAULT 1,
  payroll_enabled TINYINT(1) DEFAULT 1,
  documents_enabled TINYINT(1) DEFAULT 1,
  reports_enabled TINYINT(1) DEFAULT 1,
  price_monthly DECIMAL(10, 2) DEFAULT 0.00,
  is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Subscriptions Table
DROP TABLE IF EXISTS subscriptions;
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  plan_id INT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  max_admin_users INT NOT NULL DEFAULT 5,
  max_employees INT NOT NULL DEFAULT 50,
  max_branches INT NOT NULL DEFAULT 3,
  status ENUM('active', 'expired', 'cancelled', 'suspended') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sub_tenant (tenant_id),
  INDEX idx_sub_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Roles Table
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  is_system_default TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Permissions Table
DROP TABLE IF EXISTS permissions;
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  permission_key VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  name_ar VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Role Permissions Table
DROP TABLE IF EXISTS role_permissions;
CREATE TABLE role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  PRIMARY KEY (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Invitations Table
DROP TABLE IF EXISTS invitations;
CREATE TABLE invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  status ENUM('pending', 'accepted', 'expired', 'revoked') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_inv_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Audit Logs Table
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NULL,
  details TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_tenant (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure companies table has tenant_id
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) NOT NULL DEFAULT 'tenant-sol-102';

-- =========================================================
-- SEEDS FOR SUBSCRIPTION PLANS, ROLES & TENANTS
-- =========================================================

-- Insert Subscription Plans
INSERT INTO subscription_plans (id, name_ar, name_en, max_admin_users, max_employees, max_branches, max_storage_mb, price_monthly) VALUES
(1, 'الباقة المبتدئة (Basic)', 'Basic Plan', 2, 25, 1, 1000, 299.00),
(2, 'الباقة المؤسسية (Enterprise)', 'Enterprise Plan', 10, 200, 5, 10000, 999.00),
(3, 'الباقة الغير محدودة (Unlimited)', 'Unlimited Plan', 100, 5000, 50, 100000, 2999.00);

-- Insert Primary Demo Tenant Companies
INSERT INTO tenants (tenant_id, company_code, slug, subdomain, status, created_at) VALUES
('tenant-sol-102', 'HADIYAH', 'hadiyah', 'hadiyah.beattend.com', 'active', NOW()),
('tenant-alfanar-103', 'ALFANAR', 'alfanar', 'alfanar.beattend.com', 'active', NOW()),
('tenant-test-104', 'DEMOCO', 'democo', 'democo.beattend.com', 'suspended', NOW());

-- Insert Tenant Subscriptions
INSERT INTO subscriptions (id, tenant_id, plan_id, start_date, end_date, max_admin_users, max_employees, max_branches, status) VALUES
(1, 'tenant-sol-102', 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 10, 200, 5, 'active'),
(2, 'tenant-alfanar-103', 1, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 2, 25, 1, 'active'),
(3, 'tenant-test-104', 1, NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY), 2, 25, 1, 'expired');

-- Insert Base System Roles
INSERT INTO roles (id, tenant_id, name_ar, name_en, description, is_system_default) VALUES
(1, NULL, 'مدير النظام الفائق (Super Admin)', 'Super Admin', 'صلاحيات كاملة للتحكم في المنصة وكافة الشركات', 1),
(2, NULL, 'مدير المنشأة (Company Admin)', 'Company Admin', 'إدارة مستخدمي وموظفي وإعدادات الشركة', 1),
(3, NULL, 'مدير الموارد البشرية (HR Manager)', 'HR Manager', 'إدارة الحضور والغياب والإجازات والطلبات', 1),
(4, NULL, 'مسؤول الرواتب (Payroll Officer)', 'Payroll Officer', 'إعداد ومراجعة واعتماد مسيرات الرواتب', 1),
(5, NULL, 'مدير القسم (Department Manager)', 'Department Manager', 'اعتماد طلبات موظفي القسم', 1),
(6, NULL, 'موظف (Employee)', 'Employee', 'استخدام تطبيق الجوال والبصمة الشخصية', 1);

-- Ensure company Hadiyah exists for tenant-sol-102
INSERT IGNORE INTO companies (id, tenant_id, name, name_ar, cr_number, tax_number, is_active, created_at) VALUES
(1, 'tenant-sol-102', 'Hadiyah HQ', 'شركة الحلول المتقدمة (Hadiyah HQ)', '1010998877', '300998877660003', 1, NOW()),
(2, 'tenant-alfanar-103', 'Al Fanar Co', 'شركة الفنار للمقاولات', '1010554433', '300554433220003', 1, NOW());

SET FOREIGN_KEY_CHECKS = 1;
