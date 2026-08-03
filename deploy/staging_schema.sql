-- =====================================================
-- BeatAttend Enterprise MariaDB Staging Schema
-- Database: beattend_staging_db
-- Safety Protocol: Isolated Staging Environment Only
-- =====================================================

CREATE DATABASE IF NOT EXISTS beattend_staging_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE beattend_staging_db;

-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    cr_number VARCHAR(100),
    tax_number VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    company_id INT NOT NULL,
    department_id INT NOT NULL,
    employee_number VARCHAR(64) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Attendance Sessions Table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    employee_id INT NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    location_name VARCHAR(255) DEFAULT 'Staging HQ',
    work_hours DECIMAL(4,2) DEFAULT 8.00,
    status VARCHAR(64) DEFAULT 'Present',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    days_allowed INT DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL,
    status VARCHAR(64) DEFAULT 'Pending',
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Staging Records
INSERT INTO tenants (id, name, domain) VALUES ('tenant-sol-102', 'Solutions Enterprise Staging', 'staging.solutions.sa') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO companies (id, tenant_id, name, name_ar, cr_number, tax_number) VALUES (1, 'tenant-sol-102', 'Solutions Co Staging', 'شركة الحلول المتقدمة (Staging)', '1010884920', '3109923849') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO departments (id, company_id, name, name_ar) VALUES (1, 1, 'IT Department', 'تقنية المعلومات') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO employees (id, tenant_id, company_id, department_id, employee_number, first_name, last_name, email) VALUES (1, 'tenant-sol-102', 1, 1, 'STG-001', 'Belal', 'Albanna', 'b.albanna@hadiyah.org.sa') ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);
INSERT INTO employees (id, tenant_id, company_id, department_id, employee_number, first_name, last_name, email) VALUES (2, 'tenant-sol-102', 1, 1, 'STG-002', 'Saad', 'Al-Otaibi', 'saad@solutions.sa') ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);
INSERT INTO attendance_sessions (id, tenant_id, employee_id, check_in, work_hours, status) VALUES (1, 'tenant-sol-102', 1, NOW(), 8.50, 'حاضر في الموعد') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO attendance_sessions (id, tenant_id, employee_id, check_in, work_hours, status) VALUES (2, 'tenant-sol-102', 2, NOW(), 8.25, 'متأخر 15 دقيقة') ON DUPLICATE KEY UPDATE status=VALUES(status);
INSERT INTO leave_types (id, name, name_ar) VALUES (1, 'Annual Leave', 'إجازة سنوية') ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days_count, status, reason) VALUES (1, 1, 1, '2026-08-05', '2026-08-10', 5, 'بانتظار موافقة المدير', 'Annual Leave Test') ON DUPLICATE KEY UPDATE status=VALUES(status);
