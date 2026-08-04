-- ============================================================================
-- BeatAttend Enterprise Payroll Upgrade Script: Accounting & Cost Centers
-- Database: beattend_staging_db
-- Date: 2026-08-04
-- Target Tables: Cost Centers, Accounting Accounts, Rule Mapping, & Journal Entries
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Cost Centers Table
CREATE TABLE IF NOT EXISTS `cost_centers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NULL,
  `parent_id` INT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_cc_code` (`tenant_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Employee Cost Center Allocations
CREATE TABLE IF NOT EXISTS `employee_cost_centers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `cost_center_id` INT NOT NULL,
  `percentage_share` DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_emp_cc_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_emp_cc_cc` FOREIGN KEY (`cost_center_id`) REFERENCES `cost_centers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Chart of Accounts Mapping
CREATE TABLE IF NOT EXISTS `accounting_accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `account_code` VARCHAR(50) NOT NULL,
  `account_name` VARCHAR(150) NOT NULL,
  `account_type` ENUM('expense', 'payable', 'asset', 'liability') NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_acc_code` (`tenant_id`, `account_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Salary Rule Accounting Rules Mapping
CREATE TABLE IF NOT EXISTS `salary_rule_accounting_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `rule_id` INT NOT NULL,
  `debit_account_id` INT NULL,
  `credit_account_id` INT NULL,
  `analytic_account_id` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_rule_acc` (`tenant_id`, `rule_id`),
  CONSTRAINT `fk_rule_acc_rule` FOREIGN KEY (`rule_id`) REFERENCES `salary_rules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Payroll Accounting Journal Entries
CREATE TABLE IF NOT EXISTS `payroll_journal_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` VARCHAR(100) NOT NULL,
  `run_id` INT NOT NULL,
  `entry_number` VARCHAR(50) NOT NULL,
  `posting_date` DATE NOT NULL,
  `total_debit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_credit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('draft', 'posted', 'cancelled') DEFAULT 'draft',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_tenant_entry_num` (`tenant_id`, `entry_number`),
  CONSTRAINT `fk_je_run` FOREIGN KEY (`run_id`) REFERENCES `payroll_runs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Payroll Journal Entry Lines
CREATE TABLE IF NOT EXISTS `payroll_journal_entry_lines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `journal_entry_id` INT NOT NULL,
  `account_id` INT NOT NULL,
  `cost_center_id` INT NULL,
  `debit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `credit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `description` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_jel_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `payroll_journal_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
