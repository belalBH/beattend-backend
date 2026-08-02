<?php
/**
 * Database Connection Class
 * نظام الحضور والانصراف - الاتصال بقاعدة البيانات
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
        $this->dbname = getenv('DB_NAME') ?: 'time_attendance_db';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            // Fallback to SQLite local file database if local MySQL service is not running
            $sqlitePath = __DIR__ . '/../time_attendance_sqlite.db';
            $this->connection = new PDO("sqlite:" . $sqlitePath);
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->initSqliteTables();
        }
    }

    private function initSqliteTables() {
        $this->connection->exec("
            CREATE TABLE IF NOT EXISTS companies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT UNIQUE NOT NULL,
                tenant_slug TEXT UNIQUE,
                company_domain TEXT UNIQUE,
                name TEXT NOT NULL,
                logo TEXT,
                status TEXT DEFAULT 'active',
                minimum_app_version TEXT DEFAULT '2.0.0',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS company_domain_aliases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_id INTEGER NOT NULL,
                tenant_id TEXT NOT NULL,
                normalized_domain TEXT UNIQUE NOT NULL,
                is_primary INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_number TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                branch_id INTEGER DEFAULT 1,
                department_id INTEGER DEFAULT 1,
                section_id INTEGER DEFAULT 1,
                position_id INTEGER DEFAULT 1,
                job_title_id INTEGER DEFAULT 1,
                manager_id INTEGER,
                schedule_id INTEGER DEFAULT 1,
                shift_id INTEGER DEFAULT 1,
                role_id INTEGER DEFAULT 1,
                assigned_location_id INTEGER DEFAULT 1,
                hire_date TEXT DEFAULT '2026-01-01',
                gender TEXT DEFAULT 'male',
                employment_status TEXT DEFAULT 'active',
                account_enabled INTEGER DEFAULT 1,
                is_active INTEGER DEFAULT 1,
                company_id INTEGER DEFAULT 1,
                tenant_id TEXT DEFAULT 'tenant-sol-102',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                employee_id INTEGER NOT NULL,
                tenant_id TEXT NOT NULL,
                company_id INTEGER NOT NULL,
                email TEXT NOT NULL,
                normalized_email TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                must_change_password INTEGER DEFAULT 0,
                password_changed_at DATETIME,
                role TEXT DEFAULT 'employee',
                status TEXT DEFAULT 'active',
                account_enabled INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                employee_id INTEGER NOT NULL,
                tenant_id TEXT NOT NULL,
                company_id INTEGER NOT NULL,
                refresh_token_hash TEXT NOT NULL,
                device_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                revoked_at DATETIME
            );

            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT DEFAULT 'tenant-sol-102',
                company_id INTEGER DEFAULT 1,
                name TEXT NOT NULL,
                code TEXT,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT DEFAULT 'tenant-sol-102',
                company_id INTEGER DEFAULT 1,
                title TEXT NOT NULL,
                code TEXT
            );

            CREATE TABLE IF NOT EXISTS work_locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT DEFAULT 'tenant-sol-102',
                company_id INTEGER DEFAULT 1,
                name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                radius_meters REAL DEFAULT 100.0,
                is_active INTEGER DEFAULT 1
            );
        ");

        // Seed default company & locations if empty
        $stmt = $this->connection->query("SELECT COUNT(*) as count FROM companies");
        if ((int)$stmt->fetchColumn() === 0) {
            $this->connection->exec("
                INSERT INTO companies (id, tenant_id, tenant_slug, company_domain, name, logo, status, minimum_app_version)
                VALUES (1, 'tenant-sol-102', 'solutions', 'solutions.sa', 'Solutions Co', 'https://beattend-api.onrender.com/assets/logos/solutions.png', 'active', '2.0.0'),
                       (2, 'tenant-hadiyah-103', 'hadiyah', 'hadiyah.org.sa', 'جمعية هدية (Hadiyah Association)', 'https://beattend-api.onrender.com/assets/logos/hadiyah.png', 'active', '2.0.0');

                INSERT INTO company_domain_aliases (company_id, tenant_id, normalized_domain, is_primary, is_active)
                VALUES (1, 'tenant-sol-102', 'solutions.sa', 1, 1),
                       (2, 'tenant-hadiyah-103', 'hadiyah.org.sa', 1, 1),
                       (2, 'tenant-hadiyah-103', 'hadiyah', 1, 1);

                INSERT INTO departments (id, tenant_id, company_id, name, code)
                VALUES (1, 'tenant-sol-102', 1, 'تقنية المعلومات (IT)', 'IT'),
                       (2, 'tenant-sol-102', 1, 'الموارد البشرية (HR)', 'HR');

                INSERT INTO positions (id, tenant_id, company_id, title, code)
                VALUES (1, 'tenant-sol-102', 1, 'مطور برمجيات', 'DEV'),
                       (2, 'tenant-sol-102', 1, 'مدير موارد بشرية', 'HRM');

                INSERT INTO work_locations (id, tenant_id, company_id, name, latitude, longitude, radius_meters, is_active)
                VALUES (1, 'tenant-sol-102', 1, 'Al Naseem - HQ', 24.7236, 46.7353, 100.0, 1),
                       (2, 'tenant-sol-102', 1, 'Fayha Branch', 24.7736, 46.7053, 150.0, 1);

                INSERT INTO employees (id, tenant_id, company_id, employee_number, first_name, last_name, email, department_id, position_id, assigned_location_id, account_enabled)
                VALUES (1, 'tenant-sol-102', 1, 'EMP-101', 'سعد', 'العتيبي', 'saad@solutions.sa', 1, 1, 1, 1);

                INSERT INTO users (employee_id, tenant_id, company_id, email, normalized_email, password_hash, role, status, account_enabled)
                VALUES (1, 'tenant-sol-102', 1, 'saad@solutions.sa', 'saad@solutions.sa', '$2y$10$92IXMOqn3564B83qKEC.oUdeOrNn65B6B.6p.H3R6y61iS.O/2o.6', 'employee', 'active', 1);
            ");
        }
    }
    
    /**
     * الحصول على مثيل واحد من الفئة (Singleton)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * الحصول على كائن الاتصال
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * منع الاستنساخ
     */
    private function __clone() {}
    
    /**
     * منع الاسترجاع من السيريلايز
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * API Response Class
 * فئة للرد الموحد من API
 */
class ApiResponse {
    public static function success($data = null, $message = 'Success', $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public static function error($message = 'Error', $code = 400, $errors = null) {
        $statusCode = is_numeric($code) && (int)$code >= 100 && (int)$code <= 599 ? (int)$code : 400;
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * Employee Class
 * فئة للتعامل مع الموظفين
 */
class Employee {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * تسجيل دخول موظف
     */
    public function login($email, $password) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    e.*,
                    d.name as department_name,
                    p.title as position_title
                FROM employees e
                LEFT JOIN departments d ON e.department_id = d.id
                LEFT JOIN positions p ON e.position_id = p.id
                WHERE e.email = :email AND e.is_active = 1
            ");
            $stmt->execute(['email' => $email]);
            $employee = $stmt->fetch();
            
            if ($employee && password_verify($password, $employee['password_hash'])) {
                // تحديث آخر تسجيل دخول
                $this->updateLastLogin($employee['id']);
                
                // إزالة كلمة المرور من البيانات المُرجعة
                unset($employee['password_hash']);
                
                return $employee;
            }
            
            return false;
        } catch (PDOException $e) {
            throw new Exception("خطأ في تسجيل الدخول: " . $e->getMessage());
        }
    }
    
    /**
     * الحصول على معلومات موظف
     */
    public function getEmployeeById($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM employee_details WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("خطأ في جلب بيانات الموظف: " . $e->getMessage());
        }
    }
    
    /**
     * تحديث آخر تسجيل دخول
     */
    private function updateLastLogin($employeeId) {
        $stmt = $this->db->prepare("UPDATE employees SET last_login = NOW() WHERE id = :id");
        $stmt->execute(['id' => $employeeId]);
    }
}

/**
 * Attendance Class
 * فئة للتعامل مع الحضور
 */
class Attendance {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * تسجيل حضور
     */
    public function clockIn($employeeId, $latitude = null, $longitude = null, $deviceInfo = []) {
        try {
            // التحقق من عدم وجود تبصيم سابق اليوم
            if ($this->hasClockInToday($employeeId)) {
                throw new Exception("تم التبصيم مسبقاً اليوم");
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO attendance_records (
                    employee_id, attendance_date, clock_in_time,
                    clock_in_latitude, clock_in_longitude,
                    clock_in_device_name, clock_in_device_id, clock_in_platform,
                    status
                ) VALUES (
                    :employee_id, CURDATE(), NOW(),
                    :latitude, :longitude,
                    :device_name, :device_id, :platform,
                    'present'
                )
            ");
            
            $stmt->execute([
                'employee_id' => $employeeId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'device_name' => $deviceInfo['device_name'] ?? null,
                'device_id' => $deviceInfo['device_id'] ?? null,
                'platform' => $deviceInfo['platform'] ?? null
            ]);
            
            return $this->getTodayAttendance($employeeId);
        } catch (PDOException $e) {
            throw new Exception("خطأ في تسجيل الحضور: " . $e->getMessage());
        }
    }
    
    /**
     * تسجيل انصراف
     */
    public function clockOut($employeeId, $latitude = null, $longitude = null, $deviceInfo = []) {
        try {
            // التحقق من وجود تبصيم دخول
            $attendance = $this->getTodayAttendance($employeeId);
            if (!$attendance || $attendance['clock_out_time']) {
                throw new Exception("لا يوجد تبصيم دخول أو تم التبصيم خروج مسبقاً");
            }
            
            $stmt = $this->db->prepare("
                UPDATE attendance_records SET
                    clock_out_time = NOW(),
                    clock_out_latitude = :latitude,
                    clock_out_longitude = :longitude,
                    clock_out_device_name = :device_name,
                    clock_out_device_id = :device_id,
                    clock_out_platform = :platform,
                    working_hours = TIMESTAMPDIFF(MINUTE, clock_in_time, NOW()) / 60.0
                WHERE employee_id = :employee_id 
                AND attendance_date = CURDATE()
            ");
            
            $stmt->execute([
                'employee_id' => $employeeId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'device_name' => $deviceInfo['device_name'] ?? null,
                'device_id' => $deviceInfo['device_id'] ?? null,
                'platform' => $deviceInfo['platform'] ?? null
            ]);
            
            return $this->getTodayAttendance($employeeId);
        } catch (PDOException $e) {
            throw new Exception("خطأ في تسجيل الانصراف: " . $e->getMessage());
        }
    }
    
    /**
     * التحقق من وجود تبصيم دخول اليوم
     */
    public function hasClockInToday($employeeId) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM attendance_records
            WHERE employee_id = :employee_id 
            AND attendance_date = CURDATE()
            AND clock_in_time IS NOT NULL
        ");
        $stmt->execute(['employee_id' => $employeeId]);
        $result = $stmt->fetch();
        return $result['count'] > 0;
    }
    
    /**
     * الحصول على حضور اليوم
     */
    public function getTodayAttendance($employeeId) {
        $stmt = $this->db->prepare("
            SELECT * FROM attendance_records
            WHERE employee_id = :employee_id 
            AND attendance_date = CURDATE()
        ");
        $stmt->execute(['employee_id' => $employeeId]);
        return $stmt->fetch();
    }
    
    /**
     * الحصول على سجلات الحضور لفترة معينة
     */
    public function getAttendanceRecords($employeeId, $startDate, $endDate) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM attendance_records
                WHERE employee_id = :employee_id
                AND attendance_date BETWEEN :start_date AND :end_date
                ORDER BY attendance_date DESC
            ");
            $stmt->execute([
                'employee_id' => $employeeId,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("خطأ في جلب سجلات الحضور: " . $e->getMessage());
        }
    }
    
    /**
     * الحصول على ملخص الحضور الشهري
     */
    public function getMonthlyAttendanceSummary($employeeId, $year, $month) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
                    SUM(working_hours) as total_hours,
                    AVG(working_hours) as avg_hours
                FROM attendance_records
                WHERE employee_id = :employee_id
                AND YEAR(attendance_date) = :year
                AND MONTH(attendance_date) = :month
            ");
            $stmt->execute([
                'employee_id' => $employeeId,
                'year' => $year,
                'month' => $month
            ]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            throw new Exception("خطأ في جلب ملخص الحضور: " . $e->getMessage());
        }
    }
}

/**
 * Leave Class
 * فئة للتعامل مع الإجازات
 */
class Leave {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * تقديم طلب إجازة
     */
    public function submitLeaveRequest($data) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO leave_requests (
                    employee_id, leave_type_id, start_date, end_date,
                    total_days, reason, delegate_employee_id, status
                ) VALUES (
                    :employee_id, :leave_type_id, :start_date, :end_date,
                    :total_days, :reason, :delegate_id, 'pending'
                )
            ");
            
            $stmt->execute([
                'employee_id' => $data['employee_id'],
                'leave_type_id' => $data['leave_type_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'total_days' => $data['total_days'],
                'reason' => $data['reason'],
                'delegate_id' => $data['delegate_id'] ?? null
            ]);
            
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("خطأ في تقديم طلب الإجازة: " . $e->getMessage());
        }
    }
    
    /**
     * الحصول على طلبات الإجازة
     */
    public function getLeaveRequests($employeeId, $status = null) {
        try {
            $sql = "
                SELECT 
                    lr.*,
                    lt.name as leave_type_name,
                    lt.name_ar as leave_type_name_ar
                FROM leave_requests lr
                JOIN leave_types lt ON lr.leave_type_id = lt.id
                WHERE lr.employee_id = :employee_id
            ";
            
            if ($status) {
                $sql .= " AND lr.status = :status";
            }
            
            $sql .= " ORDER BY lr.created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            $params = ['employee_id' => $employeeId];
            if ($status) {
                $params['status'] = $status;
            }
            
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("خطأ في جلب طلبات الإجازة: " . $e->getMessage());
        }
    }
    
    /**
     * الحصول على رصيد الإجازات
     */
    public function getLeaveBalance($employeeId, $year) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    lb.*,
                    lt.name as leave_type_name,
                    lt.name_ar as leave_type_name_ar
                FROM leave_balances lb
                JOIN leave_types lt ON lb.leave_type_id = lt.id
                WHERE lb.employee_id = :employee_id
                AND lb.year = :year
            ");
            $stmt->execute([
                'employee_id' => $employeeId,
                'year' => $year
            ]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("خطأ في جلب رصيد الإجازات: " . $e->getMessage());
        }
    }
}

// ضبط الترويسة للـ JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

?>
