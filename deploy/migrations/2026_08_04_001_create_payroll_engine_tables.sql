-- ============================================================================
-- BeatAttend Staging DDL Migration: Odoo-Style Enterprise Payroll Engine
-- Database: beattend_staging_db
-- Date: 2026-08-04
-- Target Tables: 24 Tables with Foreign Keys, Unique Constraints, & DECIMAL Precision
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Payroll Contracts Table
CREATE TABLE IF NOT EXISTS `payroll_contracts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `contract_number` VARCHAR(50) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `status` ENUM('active', 'expired', 'suspended') DEFAULT 'active',
  `pay_frequency` ENUM('monthly', 'daily', 'hourly') DEFAULT 'monthly',
  `currency` VARCHAR(10) DEFAULT 'SAR',
  `base_salary` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `housing_allowance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `transport_allowance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `other_allowances` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `work_hours_daily` INT DEFAULT 8,
  `work_days_monthly` INT DEFAULT 30,
  `iban` VARCHAR(50) NULL,
  `structure_id` INT NOT NULL,
  `is_gosi_enrolled` TINYINT(1) DEFAULT 1,
  `effective_date` DATE NOT NULL,
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_contract_num` (`tenant_id`, `contract_number`),
  UNIQUE KEY `uk_tenant_emp_effective` (`tenant_id`, `employee_id`, `effective_date`),
  KEY `idx_tenant_emp` (`tenant_id`, `employee_id`),
  CONSTRAINT `fk_contracts_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Payroll Contract Versions (Complete Snapshot History)
CREATE TABLE IF NOT EXISTS `payroll_contract_versions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contract_id` INT NOT NULL,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `base_salary` DECIMAL(12, 2) NOT NULL,
  `housing_allowance` DECIMAL(12, 2) NOT NULL,
  `transport_allowance` DECIMAL(12, 2) NOT NULL,
  `other_allowances` DECIMAL(12, 2) NOT NULL,
  `structure_id` INT NOT NULL,
  `pay_frequency` ENUM('monthly', 'daily', 'hourly') DEFAULT 'monthly',
  `work_hours_daily` INT DEFAULT 8,
  `work_days_monthly` INT DEFAULT 30,
  `is_gosi_enrolled` TINYINT(1) DEFAULT 1,
  `effective_date` DATE NOT NULL,
  `change_reason` VARCHAR(255) NULL,
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_contract_ver` (`contract_id`, `effective_date`),
  CONSTRAINT `fk_contract_ver_contract` FOREIGN KEY (`contract_id`) REFERENCES `payroll_contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Salary Structures
CREATE TABLE IF NOT EXISTS `salary_structures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_struct_code` (`tenant_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Salary Rules Engine Catalog
CREATE TABLE IF NOT EXISTS `salary_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NULL,
  `rule_type` ENUM('earning', 'deduction', 'employer_contribution', 'informational') NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `default_sequence` INT NOT NULL DEFAULT 100,
  `calc_method` ENUM('fixed', 'percentage', 'attendance', 'formula') NOT NULL DEFAULT 'fixed',
  `fixed_amount` DECIMAL(12, 2) DEFAULT 0.00,
  `percentage_rate` DECIMAL(6, 4) DEFAULT 0.0000,
  `formula_expression` TEXT NULL,
  `is_gosi_taxable` TINYINT(1) DEFAULT 0,
  `in_gross` TINYINT(1) DEFAULT 1,
  `in_net` TINYINT(1) DEFAULT 1,
  `in_payslip` TINYINT(1) DEFAULT 1,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_rule_code` (`tenant_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Salary Structure Rules (Many-to-Many Mapping)
CREATE TABLE IF NOT EXISTS `salary_structure_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `structure_id` INT NOT NULL,
  `rule_id` INT NOT NULL,
  `custom_sequence` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_struct_rule` (`structure_id`, `rule_id`),
  CONSTRAINT `fk_struct_rules_struct` FOREIGN KEY (`structure_id`) REFERENCES `salary_structures` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_struct_rules_rule` FOREIGN KEY (`rule_id`) REFERENCES `salary_rules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Employee Specific Rule Overrides
CREATE TABLE IF NOT EXISTS `employee_salary_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `rule_id` INT NOT NULL,
  `override_amount` DECIMAL(12, 2) NULL,
  `effective_start` DATE NOT NULL,
  `effective_end` DATE NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. GOSI Configurations Table
CREATE TABLE IF NOT EXISTS `gosi_configurations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `nationality_scope` ENUM('saudi', 'non_saudi', 'all') DEFAULT 'saudi',
  `contributor_type` VARCHAR(50) DEFAULT 'standard',
  `employee_rate` DECIMAL(6, 4) NOT NULL DEFAULT 0.0975,
  `employer_rate` DECIMAL(6, 4) NOT NULL DEFAULT 0.1175,
  `pension_rate` DECIMAL(6, 4) NOT NULL DEFAULT 0.0975,
  `unemployment_rate` DECIMAL(6, 4) NOT NULL DEFAULT 0.0075,
  `occupational_hazard_rate` DECIMAL(6, 4) NOT NULL DEFAULT 0.0200,
  `min_contributory_wage` DECIMAL(12, 2) NOT NULL DEFAULT 1500.00,
  `max_contributory_wage` DECIMAL(12, 2) NOT NULL DEFAULT 45000.00,
  `effective_from` DATE NOT NULL,
  `effective_to` DATE NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Payroll Runs
CREATE TABLE IF NOT EXISTS `payroll_runs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `period_month` INT NOT NULL,
  `period_year` INT NOT NULL,
  `period_title` VARCHAR(150) NOT NULL,
  `structure_id` INT NULL,
  `status` ENUM('draft', 'calculating', 'review', 'pending_approval', 'approved', 'posted', 'paid', 'cancelled') DEFAULT 'draft',
  `cut_off_start` DATE NOT NULL,
  `cut_off_end` DATE NOT NULL,
  `payment_date` DATE NOT NULL,
  `total_gross` DECIMAL(12, 2) DEFAULT 0.00,
  `total_deductions` DECIMAL(12, 2) DEFAULT 0.00,
  `total_net` DECIMAL(12, 2) DEFAULT 0.00,
  `total_employer_gosi` DECIMAL(12, 2) DEFAULT 0.00,
  `total_employees` INT DEFAULT 0,
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_period_struct` (`tenant_id`, `period_year`, `period_month`, `structure_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Payroll Run Employees
CREATE TABLE IF NOT EXISTS `payroll_run_employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `run_id` INT NOT NULL,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `contract_id` INT NOT NULL,
  `status` ENUM('included', 'on_hold', 'error') DEFAULT 'included',
  `error_message` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_run_emp` (`run_id`, `employee_id`),
  CONSTRAINT `fk_run_emp_run` FOREIGN KEY (`run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Payslips Table
CREATE TABLE IF NOT EXISTS `payslips` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `run_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `contract_id` INT NOT NULL,
  `gross_wage` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_deductions` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `net_wage` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `employer_gosi` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `contract_snapshot` JSON NULL,
  `rule_versions_snapshot` JSON NULL,
  `attendance_snapshot` JSON NULL,
  `gosi_snapshot` JSON NULL,
  `loan_installment_snapshot` JSON NULL,
  `calculation_trace` JSON NULL,
  `engine_version` VARCHAR(20) DEFAULT 'v2026.1',
  `rounding_policy` VARCHAR(50) DEFAULT 'HALF_UP_2DEC',
  `calculated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `calculated_by` INT NULL,
  UNIQUE KEY `uk_run_payslip_emp` (`run_id`, `employee_id`),
  CONSTRAINT `fk_payslips_run` FOREIGN KEY (`run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payslips_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payslips_contract` FOREIGN KEY (`contract_id`) REFERENCES `payroll_contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Payslip Itemized Lines
CREATE TABLE IF NOT EXISTS `payslip_lines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payslip_id` INT NOT NULL,
  `tenant_id` VARCHAR(100) NOT NULL,
  `salary_rule_id` INT NULL,
  `rule_code` VARCHAR(50) NOT NULL,
  `rule_name_ar` VARCHAR(150) NOT NULL,
  `rule_type` ENUM('earning', 'deduction', 'employer_contribution', 'informational') NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `sequence` INT NOT NULL,
  `quantity` DECIMAL(10, 2) DEFAULT 1.00,
  `rate` DECIMAL(12, 4) DEFAULT 1.0000,
  `base_amount` DECIMAL(12, 2) DEFAULT 0.00,
  `result_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `is_manual` TINYINT(1) DEFAULT 0,
  `source_type` VARCHAR(50) NULL,
  `source_id` INT NULL,
  `calculation_details` JSON NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_lines_payslip` FOREIGN KEY (`payslip_id`) REFERENCES `payslips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Employee Loans Table
CREATE TABLE IF NOT EXISTS `employee_loans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `loan_number` VARCHAR(50) NOT NULL,
  `principal_amount` DECIMAL(12, 2) NOT NULL,
  `installments_count` INT NOT NULL,
  `monthly_installment` DECIMAL(12, 2) NOT NULL,
  `remaining_balance` DECIMAL(12, 2) NOT NULL,
  `start_date` DATE NOT NULL,
  `status` ENUM('requested', 'approved', 'active', 'fully_paid', 'paused') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_loan_num` (`tenant_id`, `loan_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Loan Installments Schedule
CREATE TABLE IF NOT EXISTS `employee_loan_installments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `loan_id` INT NOT NULL,
  `tenant_id` VARCHAR(100) NOT NULL,
  `installment_number` INT NOT NULL,
  `due_date` DATE NOT NULL,
  `scheduled_amount` DECIMAL(12, 2) NOT NULL,
  `deducted_amount` DECIMAL(12, 2) DEFAULT 0.00,
  `status` ENUM('pending', 'deducted', 'skipped', 'reversed') DEFAULT 'pending',
  `payroll_run_id` INT NULL,
  `payslip_id` INT NULL,
  `posted_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_installments_loan` FOREIGN KEY (`loan_id`) REFERENCES `employee_loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Overtime Approved Entries
CREATE TABLE IF NOT EXISTS `overtime_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `entry_date` DATE NOT NULL,
  `approved_hours` DECIMAL(6, 2) NOT NULL,
  `multiplier` DECIMAL(4, 2) DEFAULT 1.50,
  `calculated_amount` DECIMAL(12, 2) DEFAULT 0.00,
  `status` ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'approved',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Business Trip Entries (الانتداب)
CREATE TABLE IF NOT EXISTS `business_trip_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `trip_title` VARCHAR(150) NOT NULL,
  `trip_type` ENUM('internal', 'external') DEFAULT 'internal',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `days_count` INT NOT NULL,
  `daily_allowance` DECIMAL(12, 2) NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('pending', 'approved', 'processed') DEFAULT 'approved',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Payroll Inputs (Variable Extra Earnings & Deductions)
CREATE TABLE IF NOT EXISTS `payroll_inputs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `run_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `rule_code` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Payroll Adjustments (Retroactive)
CREATE TABLE IF NOT EXISTS `payroll_adjustments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `adjustment_type` ENUM('earning', 'deduction') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'applied') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Attendance Snapshots
CREATE TABLE IF NOT EXISTS `payroll_attendance_snapshots` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `run_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `working_days` INT DEFAULT 30,
  `present_days` INT DEFAULT 30,
  `absence_days` INT DEFAULT 0,
  `lateness_minutes` INT DEFAULT 0,
  `overtime_hours` DECIMAL(6, 2) DEFAULT 0.00,
  `snapshot_data` JSON NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Approval Workflow Audit Log
CREATE TABLE IF NOT EXISTS `payroll_approval_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `run_id` INT NOT NULL,
  `from_status` VARCHAR(50) NOT NULL,
  `to_status` VARCHAR(50) NOT NULL,
  `action_by` INT NOT NULL,
  `comments` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. Payment Batches
CREATE TABLE IF NOT EXISTS `payroll_payment_batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `run_id` INT NOT NULL,
  `batch_reference` VARCHAR(50) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'WPS_MUDAD',
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('draft', 'exported', 'confirmed', 'failed') DEFAULT 'draft',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. Payment Batch Lines
CREATE TABLE IF NOT EXISTS `payroll_payment_lines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batch_id` INT NOT NULL,
  `employee_id` INT NOT NULL,
  `iban` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  `failure_reason` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. Export File Snapshots
CREATE TABLE IF NOT EXISTS `payroll_export_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `run_id` INT NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(150) NOT NULL,
  `file_content` LONGTEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 23. Engine Calculation Versions
CREATE TABLE IF NOT EXISTS `payroll_calculation_versions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `version_code` VARCHAR(20) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 24. Rule Engine Rule Versions
CREATE TABLE IF NOT EXISTS `payroll_rule_versions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rule_id` INT NOT NULL,
  `version` INT NOT NULL DEFAULT 1,
  `rule_snapshot` JSON NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
