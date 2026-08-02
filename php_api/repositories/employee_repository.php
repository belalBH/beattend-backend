<?php
/**
 * Employee Repository Class
 */
class EmployeeRepository {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    public function normalizeEmail($email) {
        return strtolower(trim((string)$email));
    }

    public function getAuthAccountByTenantCompanyEmail($tenantId, $companyId, $email) {
        $normalized = $this->normalizeEmail($email);
        $stmt = $this->db->prepare("
            SELECT u.*, e.employee_number, e.first_name, e.last_name, e.phone, e.department_id, 
                   e.position_id, e.assigned_location_id, e.employment_status as employee_status,
                   c.status as company_status, c.name as company_name
            FROM users u
            JOIN employees e ON u.employee_id = e.id
            JOIN companies c ON u.company_id = c.id
            WHERE u.tenant_id = :tenantId 
              AND u.company_id = :companyId 
              AND u.normalized_email = :normalizedEmail
            LIMIT 1
        ");
        $stmt->execute([
            'tenantId' => $tenantId,
            'companyId' => (int)$companyId,
            'normalizedEmail' => $normalized
        ]);
        return $stmt->fetch();
    }

    public function getById($id, $tenantId = null) {
        $sql = "
            SELECT e.*, 
                   c.name as company_name, c.company_domain as company_domain,
                   d.name as department_name, 
                   p.title as position_title,
                   wl.name as work_location_name,
                   u.id as user_account_id, u.role as user_role, u.account_enabled as user_account_enabled
            FROM employees e
            LEFT JOIN companies c ON e.company_id = c.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN work_locations wl ON e.assigned_location_id = wl.id
            LEFT JOIN users u ON u.employee_id = e.id AND u.tenant_id = e.tenant_id
            WHERE e.id = :id
        ";
        $params = ['id' => (int)$id];

        if ($tenantId !== null && $tenantId !== '') {
            $sql .= " AND e.tenant_id = :tenantId";
            $params['tenantId'] = $tenantId;
        }

        $sql .= " LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    public function getAllByTenant($tenantId, $companyId = null) {
        $sql = "
            SELECT e.id, e.employee_number, e.first_name, e.last_name, e.email, e.phone,
                   e.tenant_id, e.company_id, e.department_id, e.assigned_location_id,
                   e.employment_status, e.account_enabled,
                   c.name as company_name,
                   d.name as department_name,
                   p.title as position_title,
                   wl.name as work_location_name,
                   u.role as user_role, u.account_enabled as user_account_enabled
            FROM employees e
            LEFT JOIN companies c ON e.company_id = c.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN work_locations wl ON e.assigned_location_id = wl.id
            LEFT JOIN users u ON u.employee_id = e.id AND u.tenant_id = e.tenant_id
            WHERE e.tenant_id = :tenantId
        ";
        $params = ['tenantId' => $tenantId];

        if ($companyId !== null && $companyId > 0) {
            $sql .= " AND e.company_id = :companyId";
            $params['companyId'] = (int)$companyId;
        }

        $sql .= " ORDER BY e.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function createEmployeeWithAccountTransaction($employeeData, $userData) {
        $this->db->beginTransaction();
        try {
            // 1. Verify company belongs to authenticated tenant
            $stmt = $this->db->prepare("SELECT id FROM companies WHERE id = :companyId AND tenant_id = :tenantId AND status = 'active' LIMIT 1");
            $stmt->execute([
                'companyId' => (int)$employeeData['company_id'],
                'tenantId' => $employeeData['tenant_id']
            ]);
            if (!$stmt->fetch()) {
                throw new Exception("الشركة المحددة غير صالحة أو لا تنتمي لمساحة العمل هذه.", 400);
            }

            // 2. Validate tenant-scoped employee number uniqueness
            $stmt = $this->db->prepare("SELECT id FROM employees WHERE tenant_id = :tenantId AND employee_number = :empNum LIMIT 1");
            $stmt->execute([
                'tenantId' => $employeeData['tenant_id'],
                'empNum' => $employeeData['employee_number']
            ]);
            if ($stmt->fetch()) {
                throw new Exception("رقم الموظف (" . $employeeData['employee_number'] . ") مسجل سابقاً لهذا المستأجر.", 400);
            }

            // 3. Validate tenant + company + normalized email uniqueness in users table
            $normalizedEmail = $this->normalizeEmail($employeeData['email']);
            $stmt = $this->db->prepare("SELECT id FROM users WHERE tenant_id = :tenantId AND company_id = :companyId AND normalized_email = :normalizedEmail LIMIT 1");
            $stmt->execute([
                'tenantId' => $employeeData['tenant_id'],
                'companyId' => (int)$employeeData['company_id'],
                'normalizedEmail' => $normalizedEmail
            ]);
            if ($stmt->fetch()) {
                throw new Exception("البريد الإلكتروني (" . $employeeData['email'] . ") مسجل سابقاً لهذه الشركة.", 400);
            }

            // 4. Insert Employee Record
            $stmt = $this->db->prepare("
                INSERT INTO employees (
                    tenant_id, company_id, branch_id, employee_number, first_name, last_name, email, phone,
                    department_id, section_id, position_id, job_title_id, manager_id, schedule_id, shift_id,
                    assigned_location_id, role_id, hire_date, gender, employment_status, account_enabled, is_active
                ) VALUES (
                    :tenant_id, :company_id, :branch_id, :employee_number, :first_name, :last_name, :email, :phone,
                    :department_id, :section_id, :position_id, :job_title_id, :manager_id, :schedule_id, :shift_id,
                    :assigned_location_id, :role_id, :hire_date, :gender, :employment_status, :account_enabled, 1
                )
            ");
            $stmt->execute([
                'tenant_id' => $employeeData['tenant_id'],
                'company_id' => (int)$employeeData['company_id'],
                'branch_id' => $employeeData['branch_id'] ?? null,
                'employee_number' => $employeeData['employee_number'],
                'first_name' => $employeeData['first_name'],
                'last_name' => $employeeData['last_name'],
                'email' => $employeeData['email'],
                'phone' => $employeeData['phone'] ?? '',
                'department_id' => $employeeData['department_id'] ?? 1,
                'section_id' => $employeeData['section_id'] ?? null,
                'position_id' => $employeeData['position_id'] ?? 1,
                'job_title_id' => $employeeData['job_title_id'] ?? null,
                'manager_id' => $employeeData['manager_id'] ?? null,
                'schedule_id' => $employeeData['schedule_id'] ?? null,
                'shift_id' => $employeeData['shift_id'] ?? null,
                'assigned_location_id' => $employeeData['assigned_location_id'] ?? 1,
                'role_id' => $employeeData['role_id'] ?? null,
                'hire_date' => $employeeData['hire_date'] ?? date('Y-m-d'),
                'gender' => $employeeData['gender'] ?? 'male',
                'employment_status' => $employeeData['employment_status'] ?? 'active',
                'account_enabled' => $employeeData['account_enabled'] ?? 1,
            ]);
            $employeeId = (int)$this->db->lastInsertId();

            // 5. Insert Linked Authentication User Account
            $hashedPassword = password_hash($userData['password'], PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("
                INSERT INTO users (
                    user_id, employee_id, tenant_id, company_id, email, normalized_email, password_hash, role, status, account_enabled
                ) VALUES (
                    :userId, :employeeId, :tenantId, :companyId, :email, :normalizedEmail, :passwordHash, :role, :status, :accountEnabled
                )
            ");
            $stmt->execute([
                'userId' => $employeeId,
                'employeeId' => $employeeId,
                'tenantId' => $employeeData['tenant_id'],
                'companyId' => (int)$employeeData['company_id'],
                'email' => $employeeData['email'],
                'normalizedEmail' => $normalizedEmail,
                'passwordHash' => $hashedPassword,
                'role' => $userData['role'] ?? 'employee',
                'status' => $employeeData['employment_status'] ?? 'active',
                'accountEnabled' => $employeeData['account_enabled'] ?? 1,
            ]);
            $userId = (int)$this->db->lastInsertId();

            $this->db->commit();
            return [
                'employeeId' => $employeeId,
                'userId' => $userId
            ];
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function updateEmployeeWithAccountTransaction($id, $employeeData, $userData = null) {
        $this->db->beginTransaction();
        try {
            // Update employee identity and organization fields
            $stmt = $this->db->prepare("
                UPDATE employees 
                SET company_id = :company_id,
                    branch_id = :branch_id,
                    employee_number = :employee_number,
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    phone = :phone,
                    department_id = :department_id,
                    section_id = :section_id,
                    position_id = :position_id,
                    job_title_id = :job_title_id,
                    manager_id = :manager_id,
                    schedule_id = :schedule_id,
                    shift_id = :shift_id,
                    assigned_location_id = :assigned_location_id,
                    role_id = :role_id,
                    employment_status = :employment_status,
                    account_enabled = :account_enabled
                WHERE id = :id AND tenant_id = :tenant_id
            ");
            $stmt->execute([
                'id' => (int)$id,
                'tenant_id' => $employeeData['tenant_id'],
                'company_id' => (int)$employeeData['company_id'],
                'branch_id' => $employeeData['branch_id'] ?? null,
                'employee_number' => $employeeData['employee_number'],
                'first_name' => $employeeData['first_name'],
                'last_name' => $employeeData['last_name'],
                'email' => $employeeData['email'],
                'phone' => $employeeData['phone'] ?? '',
                'department_id' => $employeeData['department_id'] ?? 1,
                'section_id' => $employeeData['section_id'] ?? null,
                'position_id' => $employeeData['position_id'] ?? 1,
                'job_title_id' => $employeeData['job_title_id'] ?? null,
                'manager_id' => $employeeData['manager_id'] ?? null,
                'schedule_id' => $employeeData['schedule_id'] ?? null,
                'shift_id' => $employeeData['shift_id'] ?? null,
                'assigned_location_id' => $employeeData['assigned_location_id'] ?? 1,
                'role_id' => $employeeData['role_id'] ?? null,
                'employment_status' => $employeeData['employment_status'] ?? 'active',
                'account_enabled' => $employeeData['account_enabled'] ?? 1,
            ]);

            $normalizedEmail = $this->normalizeEmail($employeeData['email']);
            $stmt = $this->db->prepare("
                UPDATE users 
                SET company_id = :companyId,
                    email = :email,
                    normalized_email = :normalizedEmail,
                    role = COALESCE(:role, role),
                    status = :status,
                    account_enabled = :accountEnabled
                WHERE employee_id = :employeeId AND tenant_id = :tenantId
            ");
            $stmt->execute([
                'companyId' => (int)$employeeData['company_id'],
                'email' => $employeeData['email'],
                'normalizedEmail' => $normalizedEmail,
                'role' => $userData['role'] ?? null,
                'status' => $employeeData['employment_status'] ?? 'active',
                'accountEnabled' => $employeeData['account_enabled'] ?? 1,
                'employeeId' => (int)$id,
                'tenantId' => $employeeData['tenant_id'],
            ]);

            // If no user account existed for this employee, create one automatically
            if ($stmt->rowCount() === 0) {
                $checkStmt = $this->db->prepare("SELECT id FROM users WHERE employee_id = :empId AND tenant_id = :tenantId");
                $checkStmt->execute(['empId' => (int)$id, 'tenantId' => $employeeData['tenant_id']]);
                if (!$checkStmt->fetch()) {
                    $insertUser = $this->db->prepare("
                        INSERT INTO users (
                            employee_id, tenant_id, company_id, email, normalized_email, password_hash, role, status, account_enabled
                        ) VALUES (
                            :employeeId, :tenantId, :companyId, :email, :normalizedEmail, :passwordHash, :role, :status, :accountEnabled
                        )
                    ");
                    $defaultHash = password_hash('password123', PASSWORD_DEFAULT);
                    $insertUser->execute([
                        'employeeId' => (int)$id,
                        'tenantId' => $employeeData['tenant_id'],
                        'companyId' => (int)$employeeData['company_id'],
                        'email' => $employeeData['email'],
                        'normalizedEmail' => $normalizedEmail,
                        'passwordHash' => $defaultHash,
                        'role' => $userData['role'] ?? 'employee',
                        'status' => $employeeData['employment_status'] ?? 'active',
                        'accountEnabled' => $employeeData['account_enabled'] ?? 1
                    ]);
                }
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function setAccountStatus($id, $tenantId, $enabled) {
        $this->db->beginTransaction();
        try {
            $val = $enabled ? 1 : 0;
            $stmt = $this->db->prepare("UPDATE employees SET account_enabled = :val WHERE id = :id AND tenant_id = :tenantId");
            $stmt->execute(['val' => $val, 'id' => (int)$id, 'tenantId' => $tenantId]);

            $stmt = $this->db->prepare("UPDATE users SET account_enabled = :val WHERE employee_id = :id AND tenant_id = :tenantId");
            $stmt->execute(['val' => $val, 'id' => (int)$id, 'tenantId' => $tenantId]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function resetPassword($id, $tenantId, $newPassword) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE users SET password_hash = :hash WHERE employee_id = :id AND tenant_id = :tenantId");
        return $stmt->execute(['hash' => $hashedPassword, 'id' => (int)$id, 'tenantId' => $tenantId]);
    }

    public function updateLastLogin($id) {
        $stmt = $this->db->prepare("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE employee_id = :id");
        $stmt->execute(['id' => (int)$id]);
    }
}
