# 🗄️ Final Database Migration Plan (`FINAL_DATABASE_MIGRATION_PLAN.md`)

**Target Database**: MariaDB 10.11 (`beattend_db`)  
**Character Set**: `utf8mb4` | **Collation**: `utf8mb4_unicode_ci`  
**Safety Protocol**: **Non-Destructive Schema Creation Only**  
**Verification Status**: **`[PROPOSED - BLOCKING DEPLOYMENT UNTIL PHASE 4 APPROVAL]`**  

---

## 1. Safety Audit & Destructive Statement Removal

- **Original SQL**: `time_attendance/database/time_attendance_mysql.sql` line 12 contained `DROP DATABASE IF EXISTS time_attendance_db;`.
- **Sanitization Protocol**: All `DROP DATABASE` and `DROP TABLE` statements have been removed.
- **Unified Name**: Target database name is `beattend_db`.

---

## 2. Non-Destructive Creation Commands

```sql
-- 1. Create Production Database safely
CREATE DATABASE IF NOT EXISTS beattend_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Create MariaDB User with Restricted Permissions
CREATE USER IF NOT EXISTS 'beattend_user'@'127.0.0.1' IDENTIFIED BY 'SECRET_SECURE_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER ON beattend_db.* TO 'beattend_user'@'127.0.0.1';
FLUSH PRIVILEGES;
```

---

## 3. Initial Core Schema Tables

```sql
USE beattend_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INT NOT NULL,
    hire_date DATE,
    gender VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users Table (Web Auth Profiles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee',
    tenant_id VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
