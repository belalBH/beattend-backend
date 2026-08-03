<?php
/**
 * Database Connection Class
 * نظام الحضور والانصراف - الاتصال بقاعدة البيانات beattend_staging_db
 */

class Database {
    private static $instance = null;
    private $connection;
    private $host;
    private $dbname;
    private $username;
    private $password;
    private $charset = 'utf8mb4';
    
    /**
     * Constructor - Private لتطبيق Singleton Pattern
     */
    private function __construct() {
        $this->host = getenv('DB_HOST') ?: '127.0.0.1';
        $this->dbname = getenv('DB_NAME') ?: 'beattend_staging_db';
        $this->username = getenv('DB_USER') ?: 'beattend_staging_user';
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'StagingPass2026!';

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            // Secondary fallback attempt with root account on localhost for beattend_staging_db
            try {
                $dsn = "mysql:host={$this->host};dbname=beattend_staging_db;charset={$this->charset}";
                $this->connection = new PDO($dsn, 'root', '', [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
            } catch (PDOException $e2) {
                // SQLite fallback for local offline development
                $sqlitePath = __DIR__ . '/time_attendance_sqlite.db';
                $this->connection = new PDO("sqlite:" . $sqlitePath);
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                $this->initSqliteTables();
            }
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    private function initSqliteTables() {
        $this->connection->exec("CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id TEXT NOT NULL,
            name TEXT NOT NULL,
            name_ar TEXT NOT NULL,
            cr_number TEXT,
            tax_number TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        $this->connection->exec("CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id TEXT NOT NULL,
            company_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            employee_number TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        $this->connection->exec("CREATE TABLE IF NOT EXISTS attendance_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tenant_id TEXT NOT NULL,
            employee_id INTEGER NOT NULL,
            check_in DATETIME,
            check_out DATETIME,
            status TEXT DEFAULT 'Present',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        $this->connection->exec("CREATE TABLE IF NOT EXISTS leave_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            leave_type_id INTEGER NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            days_count INTEGER NOT NULL,
            status TEXT DEFAULT 'Pending',
            reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
    }
}
