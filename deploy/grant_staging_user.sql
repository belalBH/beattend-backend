CREATE USER IF NOT EXISTS 'beattend_staging_user'@'localhost' IDENTIFIED BY 'StagingPass2026!';
GRANT ALL PRIVILEGES ON beattend_staging_db.* TO 'beattend_staging_user'@'localhost';
FLUSH PRIVILEGES;
