-- =========================================================
-- Phase 1: Geofences Table Upgrade & Seed in beattend_staging_db
-- =========================================================

USE beattend_staging_db;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS geofences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL DEFAULT 'tenant-sol-102',
  company_id INT NOT NULL DEFAULT 1,
  branch_id INT NULL DEFAULT 1,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INT NOT NULL DEFAULT 150,
  linked_employees_count INT DEFAULT 0,
  linked_shift_name VARCHAR(150) NULL DEFAULT 'الشفت الصباحي الأساسي',
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS geofence_employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  geofence_id INT NOT NULL,
  employee_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_geo_emp (geofence_id, employee_id),
  FOREIGN KEY (geofence_id) REFERENCES geofences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clear and insert seed geofence locations
TRUNCATE TABLE geofences;

INSERT INTO geofences (id, tenant_id, company_id, branch_id, name_ar, name_en, latitude, longitude, radius_meters, linked_employees_count, linked_shift_name, is_active) VALUES
(1, 'tenant-sol-102', 1, 1, 'مقر Fayha Branch الرئيسي (HQ)', 'Fayha Main Branch HQ', 24.68770000, 46.72190000, 150, 3, 'الشفت الصباحي الأساسي', 1),
(2, 'tenant-sol-102', 1, 2, 'مقر Al Naseem - الفرع الثاني', 'Al Naseem Branch 2', 24.71360000, 46.67530000, 200, 2, 'الشفت المسائي والدورية', 1),
(3, 'tenant-sol-102', 1, 1, 'مقر مكة المكرمة - العزيزية', 'Makkah Al-Aziziyah Branch', 21.42250000, 39.82620000, 300, 1, 'الشفت الصباحي الأساسي', 1);

SET FOREIGN_KEY_CHECKS = 1;
