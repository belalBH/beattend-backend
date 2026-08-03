-- =========================================================
-- Upgrade employees table in beattend_staging_db with full HR columns & seed 5 demo records
-- =========================================================

USE beattend_staging_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Add missing columns safely if not exists
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS branch_id INT NULL AFTER company_id,
ADD COLUMN IF NOT EXISTS arabic_name VARCHAR(255) NULL AFTER last_name,
ADD COLUMN IF NOT EXISTS english_name VARCHAR(255) NULL AFTER arabic_name,
ADD COLUMN IF NOT EXISTS identity_number VARCHAR(64) NULL AFTER phone,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) NULL DEFAULT 'سعودي' AFTER identity_number,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NULL DEFAULT 'male' AFTER nationality,
ADD COLUMN IF NOT EXISTS birth_date DATE NULL AFTER gender,
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50) NULL DEFAULT 'متزوج' AFTER birth_date,
ADD COLUMN IF NOT EXISTS job_title VARCHAR(150) NULL DEFAULT 'أخصائي تطوير' AFTER marital_status,
ADD COLUMN IF NOT EXISTS manager_id INT NULL AFTER job_title,
ADD COLUMN IF NOT EXISTS hire_date DATE NULL AFTER manager_id,
ADD COLUMN IF NOT EXISTS contract_type VARCHAR(100) NULL DEFAULT 'دوام كامل' AFTER hire_date,
ADD COLUMN IF NOT EXISTS shift_id INT NULL DEFAULT 1 AFTER contract_type,
ADD COLUMN IF NOT EXISTS geofence_id INT NULL DEFAULT 1 AFTER shift_id,
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150) NULL DEFAULT 'البنك الأهلي السعودي (SNB)' AFTER geofence_id,
ADD COLUMN IF NOT EXISTS iban VARCHAR(64) NULL AFTER bank_name,
ADD COLUMN IF NOT EXISTS role_id INT NULL DEFAULT 1 AFTER iban;

-- Ensure departments exist
INSERT IGNORE INTO departments (id, company_id, name, name_ar, is_active, created_at) VALUES 
(1, 1, 'IT Department', 'تقنية المعلومات', 1, NOW()),
(2, 1, 'HR Department', 'الموارد البشرية', 1, NOW()),
(3, 1, 'Finance Department', 'الشؤون المالية', 1, NOW()),
(4, 1, 'Design Department', 'التصميم والمنتجات', 1, NOW());

-- Clear old records
TRUNCATE TABLE employees;

INSERT INTO employees (
  id, tenant_id, company_id, branch_id, department_id, employee_number,
  first_name, last_name, arabic_name, english_name, email, phone,
  identity_number, nationality, gender, birth_date, marital_status,
  job_title, manager_id, hire_date, contract_type, shift_id, geofence_id,
  bank_name, iban, role_id, is_active, created_at
) VALUES 
(
  1, 'tenant-sol-102', 1, 1, 1, 'EMP-STG-101',
  'بلال', 'البنا', 'بلال فاروق البنا', 'Belal Albanna', 'b.albanna@hadiyah.org.sa', '0501234567',
  '1098765432', 'سعودي', 'male', '1992-05-15', 'متزوج',
  'كبير مهندسي النظم والتقنية', 1, '2024-01-01', 'عقد محدد المدة (سنوي)', 1, 1,
  'البنك الأهلي السعودي (SNB)', 'SA0310000001234567890123', 1, 1, NOW()
),
(
  2, 'tenant-sol-102', 1, 1, 1, 'EMP-STG-102',
  'فهد', 'الدوسري', 'فهد بن سلطان الدوسري', 'Fahad Al-Dosari', 'f.dosari@solutions.sa', '0509988776',
  '1087654321', 'سعودي', 'male', '1990-08-20', 'متزوج',
  'مدير قسم تقنية المعلومات', 1, '2023-06-15', 'عقد غير محدد المدة', 1, 1,
  'مصرف الراجحي', 'SA5580000009876543210987', 2, 1, NOW()
),
(
  3, 'tenant-sol-102', 1, 1, 2, 'EMP-STG-103',
  'سارة', 'العتيبي', 'سارة بنت خالد العتيبي', 'Sarah Al-Otaibi', 's.otaibi@solutions.sa', '0551122334',
  '1076543210', 'سعودي', 'female', '1995-03-10', 'أعزب',
  'أخصائي أول موارد بشرية', 2, '2024-02-01', 'عقد محدد المدة', 1, 1,
  'بنك الرياض', 'SA2020000001122334455667', 3, 1, NOW()
),
(
  4, 'tenant-sol-102', 1, 2, 3, 'EMP-STG-104',
  'عمر', 'الشهري', 'عمر عبد الله الشهري', 'Omar Al-Shehri', 'o.shehri@solutions.sa', '0544455667',
  '1065432109', 'سعودي', 'male', '1988-11-25', 'متزوج',
  'مراقب ماليات وحسابات', 2, '2022-09-01', 'عقد غير محدد المدة', 2, 2,
  'مصرف الإنماء', 'SA0505000004455667788990', 4, 1, NOW()
),
(
  5, 'tenant-sol-102', 1, 2, 4, 'EMP-STG-105',
  'نورة', 'القحطاني', 'نورة بنت محمد القحطاني', 'Noura Al-Qahtani', 'n.qahtani@solutions.sa', '0567788990',
  '1054321098', 'سعودي', 'female', '1996-07-04', 'أعزب',
  'مطور واجهات ومصمم تجربة', 1, '2024-03-15', 'عقد محدد المدة', 1, 2,
  'البنك الأهلي السعودي (SNB)', 'SA0310000009988776655443', 4, 1, NOW()
);

SET FOREIGN_KEY_CHECKS = 1;
