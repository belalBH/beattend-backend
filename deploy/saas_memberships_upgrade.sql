-- =========================================================
-- Multi-Tenant Memberships, Decoupled Users & Platform RBAC Upgrade
-- Environment: beattend_staging_db
-- =========================================================

USE beattend_staging_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop obsolete legacy foreign keys referencing old tenants(id)
ALTER TABLE companies DROP FOREIGN KEY companies_ibfk_1 2>/dev/null || true;
ALTER TABLE employees DROP FOREIGN KEY employees_ibfk_1 2>/dev/null || true;

-- 1. Master Users Table (Decoupled from single tenant)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(64) NULL,
  is_platform_superadmin TINYINT(1) DEFAULT 0,
  global_status ENUM('active', 'suspended', 'unverified') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tenant Memberships Table (Many-to-Many Users <-> Tenants)
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

-- 3. User Membership Roles Junction
CREATE TABLE IF NOT EXISTS user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  membership_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_mem_role (membership_id, role_id),
  FOREIGN KEY (membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean existing seed users
TRUNCATE TABLE user_roles;
TRUNCATE TABLE tenant_memberships;
TRUNCATE TABLE users;

-- 4. Seed Platform Super Admin User (Pass: SuperAdmin2026!)
INSERT INTO users (id, email, password_hash, full_name, is_platform_superadmin, global_status) VALUES
(1, 'superadmin@beattend.com', '$2y$10$e.w2T6G5Nl0x2H1M2uN.u.H7x1v9z9y9z9y9z9y9z9y9z9y9z9y9z', 'Platform Super Admin', 1, 'active');

-- 5. Seed Tenant Company Admins
-- Hadiyah Admin (Pass: HadiyahPass2026!)
INSERT INTO users (id, email, password_hash, full_name, is_platform_superadmin, global_status) VALUES
(2, 'b.albanna@hadiyah.org.sa', '$2y$10$e.w2T6G5Nl0x2H1M2uN.u.H7x1v9z9y9z9y9z9y9z9y9z9y9z9y9z', 'بلال البنا (Hadiyah Admin)', 0, 'active');

-- Al Fanar Admin (Pass: AlfanarPass2026!)
INSERT INTO users (id, email, password_hash, full_name, is_platform_superadmin, global_status) VALUES
(3, 'admin@alfanar.sa', '$2y$10$e.w2T6G5Nl0x2H1M2uN.u.H7x1v9z9y9z9y9z9y9z9y9z9y9z9y9z', 'مدير شركة الفنار', 0, 'active');

-- Tenant A Admin (Pass: TenantAPass2026!)
INSERT INTO users (id, email, password_hash, full_name, is_platform_superadmin, global_status) VALUES
(4, 'admin@tenant-a.com', '$2y$10$e.w2T6G5Nl0x2H1M2uN.u.H7x1v9z9y9z9y9z9y9z9y9z9y9z9y9z', 'Company Admin Tenant A', 0, 'active');

-- Tenant B Admin (Pass: TenantBPass2026!)
INSERT INTO users (id, email, password_hash, full_name, is_platform_superadmin, global_status) VALUES
(5, 'admin@tenant-b.com', '$2y$10$e.w2T6G5Nl0x2H1M2uN.u.H7x1v9z9y9z9y9z9y9z9y9z9y9z9y9z', 'Company Admin Tenant B', 0, 'active');

-- 6. Ensure Tenant Records in Tenants Table with Strict Alignment
INSERT INTO tenants (tenant_id, company_code, slug, subdomain, status, created_at) VALUES
('tenant-sol-102', 'HADIYAH', 'hadiyah', 'hadiyah.beattend.com', 'active', NOW()),
('tenant-alfanar-103', 'ALFANAR', 'alfanar', 'alfanar.beattend.com', 'active', NOW()),
('tenant-a-105', 'TENANTA', 'tenant-a', 'tenant-a.beattend.com', 'active', NOW()),
('tenant-b-106', 'TENANTB', 'tenant-b', 'tenant-b.beattend.com', 'active', NOW())
ON DUPLICATE KEY UPDATE status=VALUES(status);

INSERT INTO companies (id, tenant_id, name, name_ar, cr_number, tax_number, is_active) VALUES
(1, 'tenant-sol-102', 'Hadiyah HQ', 'شركة هداية للحلول التقنية (Hadiyah HQ)', '1010884920', '3109923849', 1),
(2, 'tenant-alfanar-103', 'Al Fanar Co', 'شركة الفنار للمقاولات', '1010554433', '300554433220003', 1),
(105, 'tenant-a-105', 'Tenant A Corporation', 'شركة الرواد الأولى (Tenant A)', '1010111111', '300111111100003', 1),
(106, 'tenant-b-106', 'Tenant B Corporation', 'شركة الأفق الثانية (Tenant B)', '1010222222', '300222222200003', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO subscriptions (id, tenant_id, plan_id, start_date, end_date, max_admin_users, max_employees, max_branches, status) VALUES
(1, 'tenant-sol-102', 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 10, 200, 5, 'active'),
(2, 'tenant-alfanar-103', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 2, 25, 1, 'active'),
(105, 'tenant-a-105', 2, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 5, 50, 3, 'active'),
(106, 'tenant-b-106', 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 2, 2, 1, 'active')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 7. Seed Tenant Memberships
INSERT INTO tenant_memberships (id, user_id, tenant_id, employee_id, status) VALUES
(1, 2, 'tenant-sol-102', 1, 'active'),
(2, 3, 'tenant-alfanar-103', NULL, 'active'),
(3, 4, 'tenant-a-105', NULL, 'active'),
(4, 5, 'tenant-b-106', NULL, 'active');

-- 8. Assign Roles to Memberships (Role 2 = Company Admin)
INSERT INTO user_roles (membership_id, role_id) VALUES
(1, 2),
(2, 2),
(3, 2),
(4, 2);

SET FOREIGN_KEY_CHECKS = 1;
