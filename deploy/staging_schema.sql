-- =========================================================
-- BeatAttend Staging Database Schema Initialization
-- Database: beattend_staging_db
-- =========================================================

CREATE DATABASE IF NOT EXISTS beattend_staging_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE beattend_staging_db;

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'tenant-sol-102',
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    name_en VARCHAR(255),
    logo_url VARCHAR(255),
    cr_number VARCHAR(64),
    tax_number VARCHAR(64),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'tenant-sol-102',
    company_id INT NOT NULL,
    department_id INT,
    employee_number VARCHAR(64) NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    first_name_ar VARCHAR(128),
    last_name_ar VARCHAR(128),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    national_id VARCHAR(64),
    gender VARCHAR(16),
    marital_status VARCHAR(32),
    nationality VARCHAR(64),
    birth_date DATE,
    job_title VARCHAR(128),
    hire_date DATE,
    contract_type VARCHAR(64),
    work_location VARCHAR(128),
    manager_name VARCHAR(128),
    basic_salary DECIMAL(10,2) DEFAULT 0.00,
    housing_allowance DECIMAL(10,2) DEFAULT 0.00,
    transport_allowance DECIMAL(10,2) DEFAULT 0.00,
    other_allowances DECIMAL(10,2) DEFAULT 0.00,
    gosi_number VARCHAR(64),
    iban VARCHAR(64),
    bank_name VARCHAR(128),
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Attendance Sessions / Logs Table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'tenant-sol-102',
    employee_id INT NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    work_hours DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(64) DEFAULT 'حاضر',
    location VARCHAR(255),
    device_info VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    name_ar VARCHAR(128) NOT NULL,
    max_days INT DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Leave Requests Table
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
INSERT IGNORE INTO companies (id, tenant_id, name, name_ar, cr_number, tax_number) VALUES (1, 'tenant-sol-102', 'Solutions Co Staging', 'شركة الحلول المتقدمة (Staging)', '1010884920', '3109923849');
INSERT IGNORE INTO departments (id, company_id, name, name_ar) VALUES (1, 1, 'IT Department', 'تقنية المعلومات');
INSERT IGNORE INTO employees (id, tenant_id, company_id, department_id, employee_number, first_name, last_name, email) VALUES (1, 'tenant-sol-102', 1, 1, 'STG-001', 'Belal', 'Albanna', 'b.albanna@hadiyah.org.sa');
INSERT IGNORE INTO employees (id, tenant_id, company_id, department_id, employee_number, first_name, last_name, email) VALUES (2, 'tenant-sol-102', 1, 1, 'STG-002', 'Saad', 'Al-Otaibi', 'saad@solutions.sa');
INSERT IGNORE INTO attendance_sessions (id, tenant_id, employee_id, check_in, work_hours, status) VALUES (1, 'tenant-sol-102', 1, NOW(), 8.50, 'حاضر في الموعد');
INSERT IGNORE INTO attendance_sessions (id, tenant_id, employee_id, check_in, work_hours, status) VALUES (2, 'tenant-sol-102', 2, NOW(), 8.25, 'متأخر 15 دقيقة');
INSERT IGNORE INTO leave_types (id, name, name_ar) VALUES (1, 'Annual Leave', 'إجازة سنوية');
INSERT IGNORE INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days_count, status, reason) VALUES (1, 1, 1, '2026-08-05', '2026-08-10', 5, 'بانتظار موافقة المدير', 'Annual Leave Test');
