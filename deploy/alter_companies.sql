USE beattend_staging_db;
ALTER TABLE companies ADD COLUMN tenant_id VARCHAR(64) NOT NULL DEFAULT 'tenant-sol-102';
ALTER TABLE companies ADD COLUMN name_en VARCHAR(255) NULL;
ALTER TABLE companies ADD COLUMN logo_url VARCHAR(255) NULL;
