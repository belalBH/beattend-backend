<?php
/**
 * Employee Controller - Complete CRUD Operations with Single Employee Fetch
 */
class EmployeeController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function getEmployees($tenantId, $companyId = null) {
        try {
            $sql = "
                SELECT e.*, e.employee_number AS empNo, 
                       c.name_ar AS company_name, d.name_ar AS department_name
                FROM employees e
                LEFT JOIN companies c ON e.company_id = c.id
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.tenant_id = :tenant_id
            ";
            $params = ['tenant_id' => $tenantId];

            if ($companyId) {
                $sql .= " AND e.company_id = :company_id";
                $params['company_id'] = (int)$companyId;
            }

            $sql .= " ORDER BY e.id ASC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($employees as &$emp) {
                $emp['status'] = ((bool)$emp['is_active']) ? 'active' : 'inactive';
            }

            ApiResponse::send($employees, 'تم استرجاع قائمة الموظفين بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب الموظفين: ' . $e->getMessage(), 500);
        }
    }

    public function getEmployeeById($id, $tenantId) {
        try {
            $stmt = $this->db->prepare("
                SELECT e.*, e.employee_number AS empNo,
                       c.name_ar AS company_name, d.name_ar AS department_name
                FROM employees e
                LEFT JOIN companies c ON e.company_id = c.id
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.id = :id AND e.tenant_id = :tenant_id
            ");
            $stmt->execute(['id' => (int)$id, 'tenant_id' => $tenantId]);
            $emp = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$emp) {
                ApiResponse::error('الموظف المطلوب غير موجود', 404);
                return;
            }

            $emp['status'] = ((bool)$emp['is_active']) ? 'active' : 'inactive';
            $emp['empNo'] = $emp['employee_number'];

            ApiResponse::send($emp, 'تم استرجاع بيانات الموظف بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ في جلب بيانات الموظف: ' . $e->getMessage(), 500);
        }
    }

    public function createEmployee($input, $tenantId) {
        try {
            if (empty($input['first_name']) || empty($input['last_name']) || empty($input['email'])) {
                ApiResponse::error('الاسم الأول، الاسم الأخير، والبريد الإلكتروني حقول إجبارية', 400);
                return;
            }

            $empNo = !empty($input['empNo']) ? trim($input['empNo']) : (!empty($input['employee_number']) ? trim($input['employee_number']) : 'EMP-STG-' . rand(100, 999));
            $companyId = isset($input['company_id']) ? (int)$input['company_id'] : 1;
            $departmentId = isset($input['department_id']) ? (int)$input['department_id'] : 1;
            $branchId = isset($input['branch_id']) ? (int)$input['branch_id'] : 1;
            $isActive = isset($input['is_active']) ? ((bool)$input['is_active'] ? 1 : 0) : 1;

            $stmt = $this->db->prepare("
                INSERT INTO employees (
                  tenant_id, company_id, branch_id, department_id, employee_number,
                  first_name, last_name, arabic_name, english_name, email, phone,
                  identity_number, nationality, gender, birth_date, marital_status,
                  job_title, manager_id, hire_date, contract_type, shift_id, geofence_id,
                  bank_name, iban, role_id, is_active, created_at
                )
                VALUES (
                  :tenant_id, :company_id, :branch_id, :department_id, :empNo,
                  :first_name, :last_name, :arabic_name, :english_name, :email, :phone,
                  :identity_number, :nationality, :gender, :birth_date, :marital_status,
                  :job_title, :manager_id, :hire_date, :contract_type, :shift_id, :geofence_id,
                  :bank_name, :iban, :role_id, :is_active, NOW()
                )
            ");
            $stmt->execute([
                'tenant_id' => $tenantId,
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'department_id' => $departmentId,
                'empNo' => $empNo,
                'first_name' => trim($input['first_name']),
                'last_name' => trim($input['last_name']),
                'arabic_name' => trim($input['arabic_name'] ?? ($input['first_name'] . ' ' . $input['last_name'])),
                'english_name' => trim($input['english_name'] ?? ($input['first_name'] . ' ' . $input['last_name'])),
                'email' => trim($input['email']),
                'phone' => trim($input['phone'] ?? ''),
                'identity_number' => trim($input['identity_number'] ?? ($input['national_id'] ?? '')),
                'nationality' => trim($input['nationality'] ?? 'سعودي'),
                'gender' => trim($input['gender'] ?? 'male'),
                'birth_date' => !empty($input['birth_date']) ? $input['birth_date'] : (!empty($input['dob']) ? $input['dob'] : null),
                'marital_status' => trim($input['marital_status'] ?? 'متزوج'),
                'job_title' => trim($input['job_title'] ?? 'أخصائي تطوير'),
                'manager_id' => isset($input['manager_id']) ? (int)$input['manager_id'] : 1,
                'hire_date' => !empty($input['hire_date']) ? $input['hire_date'] : date('Y-m-d'),
                'contract_type' => trim($input['contract_type'] ?? 'عقد محدد المدة'),
                'shift_id' => isset($input['shift_id']) ? (int)$input['shift_id'] : 1,
                'geofence_id' => isset($input['geofence_id']) ? (int)$input['geofence_id'] : 1,
                'bank_name' => trim($input['bank_name'] ?? 'البنك الأهلي السعودي (SNB)'),
                'iban' => trim($input['iban'] ?? ''),
                'role_id' => isset($input['role_id']) ? (int)$input['role_id'] : 1,
                'is_active' => $isActive
            ]);

            $newId = (int)$this->db->lastInsertId();
            $this->getEmployeeById($newId, $tenantId);
        } catch (Exception $e) {
            ApiResponse::error('فشل إضافة الموظف: ' . $e->getMessage(), 500);
        }
    }

    public function updateEmployee($id, $input, $tenantId) {
        try {
            $stmtCheck = $this->db->prepare("SELECT id FROM employees WHERE id = :id AND tenant_id = :tenant_id");
            $stmtCheck->execute(['id' => $id, 'tenant_id' => $tenantId]);
            if (!$stmtCheck->fetch()) {
                ApiResponse::error('الموظف المطلوب غير موجود', 404);
                return;
            }

            $fields = [];
            $params = ['id' => $id, 'tenant_id' => $tenantId];

            $allowedFields = [
                'first_name', 'last_name', 'arabic_name', 'english_name', 'email', 'phone',
                'identity_number', 'nationality', 'gender', 'birth_date', 'marital_status',
                'job_title', 'hire_date', 'contract_type', 'bank_name', 'iban'
            ];

            foreach ($allowedFields as $f) {
                if (isset($input[$f])) {
                    $fields[] = "$f = :$f";
                    $params[$f] = $input[$f];
                }
            }

            if (isset($input['national_id'])) {
                $fields[] = "identity_number = :national_id";
                $params['national_id'] = $input['national_id'];
            }

            if (isset($input['empNo']) || isset($input['employee_number'])) {
                $empNoVal = $input['empNo'] ?? $input['employee_number'];
                $fields[] = "employee_number = :empNoVal";
                $params['empNoVal'] = $empNoVal;
            }

            if (isset($input['company_id'])) {
                $fields[] = "company_id = :company_id";
                $params['company_id'] = (int)$input['company_id'];
            }

            if (isset($input['department_id'])) {
                $fields[] = "department_id = :department_id";
                $params['department_id'] = (int)$input['department_id'];
            }

            if (isset($input['branch_id'])) {
                $fields[] = "branch_id = :branch_id";
                $params['branch_id'] = (int)$input['branch_id'];
            }

            if (isset($input['is_active'])) {
                $fields[] = "is_active = :is_active";
                $params['is_active'] = (bool)$input['is_active'] ? 1 : 0;
            }

            if (empty($fields)) {
                $this->getEmployeeById($id, $tenantId);
                return;
            }

            $sql = "UPDATE employees SET " . implode(', ', $fields) . " WHERE id = :id AND tenant_id = :tenant_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $this->getEmployeeById($id, $tenantId);
        } catch (Exception $e) {
            ApiResponse::error('فشل تعديل بيانات الموظف: ' . $e->getMessage(), 500);
        }
    }

    public function deleteEmployee($id, $tenantId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM employees WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute(['id' => $id, 'tenant_id' => $tenantId]);
            ApiResponse::send(['id' => $id], 'تم حذف الموظف بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل حذف الموظف: ' . $e->getMessage(), 500);
        }
    }
}
