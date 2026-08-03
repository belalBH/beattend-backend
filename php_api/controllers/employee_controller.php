<?php
/**
 * Employee Controller - Complete CRUD Operations
 */
class EmployeeController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function getEmployees($tenantId, $companyId = null) {
        try {
            $sql = "
                SELECT e.id, e.tenant_id, e.company_id, e.department_id, e.employee_number AS empNo, 
                       e.first_name, e.last_name, e.email, e.phone, e.is_active, e.created_at,
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

            $sql .= " ORDER BY e.id DESC";

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

    public function createEmployee($input, $tenantId) {
        try {
            if (empty($input['first_name']) || empty($input['last_name']) || empty($input['email'])) {
                ApiResponse::error('الاسم الأول، الاسم الأخير، والبريد الإلكتروني حقول إجبارية', 400);
                return;
            }

            $empNo = !empty($input['empNo']) ? trim($input['empNo']) : 'STG-' . rand(100, 999);
            $companyId = isset($input['company_id']) ? (int)$input['company_id'] : 1;
            $departmentId = isset($input['department_id']) ? (int)$input['department_id'] : 1;
            $isActive = isset($input['is_active']) ? ((bool)$input['is_active'] ? 1 : 0) : 1;

            $stmt = $this->db->prepare("
                INSERT INTO employees (tenant_id, company_id, department_id, employee_number, first_name, last_name, email, phone, is_active, created_at)
                VALUES (:tenant_id, :company_id, :department_id, :empNo, :first_name, :last_name, :email, :phone, :is_active, NOW())
            ");
            $stmt->execute([
                'tenant_id' => $tenantId,
                'company_id' => $companyId,
                'department_id' => $departmentId,
                'empNo' => $empNo,
                'first_name' => trim($input['first_name']),
                'last_name' => trim($input['last_name']),
                'email' => trim($input['email']),
                'phone' => trim($input['phone'] ?? ''),
                'is_active' => $isActive
            ]);

            $newId = (int)$this->db->lastInsertId();

            $stmtFetch = $this->db->prepare("
                SELECT e.*, c.name_ar AS company_name, d.name_ar AS department_name 
                FROM employees e
                LEFT JOIN companies c ON e.company_id = c.id
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.id = :id AND e.tenant_id = :tenant_id
            ");
            $stmtFetch->execute(['id' => $newId, 'tenant_id' => $tenantId]);
            $createdEmployee = $stmtFetch->fetch(PDO::FETCH_ASSOC);
            if ($createdEmployee) {
                $createdEmployee['empNo'] = $createdEmployee['employee_number'];
                $createdEmployee['status'] = ((bool)$createdEmployee['is_active']) ? 'active' : 'inactive';
            }

            ApiResponse::send($createdEmployee, 'تم إضافة الموظف بنجاح', 201);
        } catch (Exception $e) {
            ApiResponse::error('فشل إضافة الموظف: ' . $e->getMessage(), 500);
        }
    }

    public function updateEmployee($id, $input, $tenantId) {
        try {
            $stmtCheck = $this->db->prepare("SELECT id FROM employees WHERE id = :id AND tenant_id = :tenant_id");
            $stmtCheck->execute(['id' => $id, 'tenant_id' => $tenantId]);
            if (!$stmtCheck->fetch()) {
                ApiResponse::error('الموظف غير موجود أو غير مصرح بتعديله', 404);
                return;
            }

            $fields = [];
            $params = ['id' => $id, 'tenant_id' => $tenantId];

            if (isset($input['first_name'])) {
                $fields[] = 'first_name = :first_name';
                $params['first_name'] = trim($input['first_name']);
            }
            if (isset($input['last_name'])) {
                $fields[] = 'last_name = :last_name';
                $params['last_name'] = trim($input['last_name']);
            }
            if (isset($input['email'])) {
                $fields[] = 'email = :email';
                $params['email'] = trim($input['email']);
            }
            if (isset($input['phone'])) {
                $fields[] = 'phone = :phone';
                $params['phone'] = trim($input['phone']);
            }
            if (isset($input['is_active'])) {
                $fields[] = 'is_active = :is_active';
                $params['is_active'] = (bool)$input['is_active'] ? 1 : 0;
            }

            if (empty($fields)) {
                ApiResponse::error('لا توجد بيانات محدثة لفرز التعديل', 400);
                return;
            }

            $sql = "UPDATE employees SET " . implode(', ', $fields) . " WHERE id = :id AND tenant_id = :tenant_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $stmtFetch = $this->db->prepare("
                SELECT e.*, c.name_ar AS company_name, d.name_ar AS department_name 
                FROM employees e
                LEFT JOIN companies c ON e.company_id = c.id
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE e.id = :id AND e.tenant_id = :tenant_id
            ");
            $stmtFetch->execute(['id' => $id, 'tenant_id' => $tenantId]);
            $updatedEmployee = $stmtFetch->fetch(PDO::FETCH_ASSOC);
            if ($updatedEmployee) {
                $updatedEmployee['empNo'] = $updatedEmployee['employee_number'];
                $updatedEmployee['status'] = ((bool)$updatedEmployee['is_active']) ? 'active' : 'inactive';
            }

            ApiResponse::send($updatedEmployee, 'تم تحديث بيانات الموظف بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل تحديث بيانات الموظف: ' . $e->getMessage(), 500);
        }
    }

    public function deleteEmployee($id, $tenantId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM employees WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute(['id' => $id, 'tenant_id' => $tenantId]);

            if ($stmt->rowCount() === 0) {
                ApiResponse::error('الموظف غير موجود أو سبق حذفه', 404);
                return;
            }

            ApiResponse::send(['id' => (int)$id], 'تم حذف الموظف بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل حذف الموظف: ' . $e->getMessage(), 500);
        }
    }
}
