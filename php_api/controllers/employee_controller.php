<?php
/**
 * Employee Controller
 */
require_once __DIR__ . '/../repositories/employee_repository.php';

class EmployeeController {
    private $db;
    private $employeeRepo;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->employeeRepo = new EmployeeRepository($dbConnection);
    }

    public function createEmployee($input, $tenantId) {
        try {
            if (empty($input['first_name']) || empty($input['last_name']) || empty($input['email']) || empty($input['employee_number'])) {
                ApiResponse::error('الاسم الأول، الاسم الأخير، رقم الموظف، والبريد الإلكتروني حقول إجبارية.', 400);
                return;
            }

            $companyId = isset($input['company_id']) ? (int)$input['company_id'] : 1;

            $employeeData = [
                'tenant_id' => $tenantId, // Derived from admin JWT, never trusted from raw form
                'company_id' => $companyId,
                'branch_id' => isset($input['branch_id']) ? (int)$input['branch_id'] : null,
                'employee_number' => trim($input['employee_number']),
                'first_name' => trim($input['first_name']),
                'last_name' => trim($input['last_name']),
                'email' => trim($input['email']),
                'phone' => trim($input['phone'] ?? ''),
                'department_id' => isset($input['department_id']) ? (int)$input['department_id'] : 1,
                'section_id' => isset($input['section_id']) ? (int)$input['section_id'] : null,
                'position_id' => isset($input['position_id']) ? (int)$input['position_id'] : 1,
                'job_title_id' => isset($input['job_title_id']) ? (int)$input['job_title_id'] : null,
                'manager_id' => isset($input['manager_id']) ? (int)$input['manager_id'] : null,
                'schedule_id' => isset($input['schedule_id']) ? (int)$input['schedule_id'] : null,
                'shift_id' => isset($input['shift_id']) ? (int)$input['shift_id'] : null,
                'assigned_location_id' => isset($input['assigned_location_id']) ? (int)$input['assigned_location_id'] : (isset($input['work_location_id']) ? (int)$input['work_location_id'] : 1),
                'role_id' => isset($input['role_id']) ? (int)$input['role_id'] : null,
                'hire_date' => $input['hire_date'] ?? date('Y-m-d'),
                'gender' => $input['gender'] ?? 'male',
                'employment_status' => $input['status'] ?? ($input['employment_status'] ?? 'active'),
                'account_enabled' => isset($input['account_enabled']) ? ((bool)$input['account_enabled'] ? 1 : 0) : 1,
            ];

            $userData = [
                'password' => !empty($input['password']) ? $input['password'] : 'TempPassword123!',
                'role' => $input['role'] ?? 'employee'
            ];

            // Execute atomic creation & user account provisioning transaction
            $res = $this->employeeRepo->createEmployeeWithAccountTransaction($employeeData, $userData);

            $savedEmployee = $this->employeeRepo->getById($res['employeeId'], $tenantId);

            ApiResponse::success($savedEmployee, 'تم إضافة الموظف وإنشاء حسابه بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function updateEmployee($id, $input, $tenantId) {
        try {
            $existing = $this->employeeRepo->getById($id, $tenantId);
            if (!$existing) {
                ApiResponse::error('الموظف غير موجود أو لا ينتمي لمساحة العمل هذه.', 404);
                return;
            }

            $companyId = isset($input['company_id']) ? (int)$input['company_id'] : (int)$existing['company_id'];

            $employeeData = [
                'tenant_id' => $tenantId,
                'company_id' => $companyId,
                'branch_id' => isset($input['branch_id']) ? (int)$input['branch_id'] : $existing['branch_id'],
                'employee_number' => !empty($input['employee_number']) ? trim($input['employee_number']) : $existing['employee_number'],
                'first_name' => !empty($input['first_name']) ? trim($input['first_name']) : $existing['first_name'],
                'last_name' => !empty($input['last_name']) ? trim($input['last_name']) : $existing['last_name'],
                'email' => !empty($input['email']) ? trim($input['email']) : $existing['email'],
                'phone' => isset($input['phone']) ? trim($input['phone']) : $existing['phone'],
                'department_id' => isset($input['department_id']) ? (int)$input['department_id'] : $existing['department_id'],
                'section_id' => isset($input['section_id']) ? (int)$input['section_id'] : $existing['section_id'],
                'position_id' => isset($input['position_id']) ? (int)$input['position_id'] : $existing['position_id'],
                'job_title_id' => isset($input['job_title_id']) ? (int)$input['job_title_id'] : $existing['job_title_id'],
                'manager_id' => isset($input['manager_id']) ? (int)$input['manager_id'] : $existing['manager_id'],
                'schedule_id' => isset($input['schedule_id']) ? (int)$input['schedule_id'] : $existing['schedule_id'],
                'shift_id' => isset($input['shift_id']) ? (int)$input['shift_id'] : $existing['shift_id'],
                'assigned_location_id' => isset($input['assigned_location_id']) ? (int)$input['assigned_location_id'] : (isset($input['work_location_id']) ? (int)$input['work_location_id'] : $existing['assigned_location_id']),
                'role_id' => isset($input['role_id']) ? (int)$input['role_id'] : $existing['role_id'],
                'employment_status' => $input['status'] ?? ($input['employment_status'] ?? $existing['employment_status']),
                'account_enabled' => isset($input['account_enabled']) ? ((bool)$input['account_enabled'] ? 1 : 0) : $existing['account_enabled'],
            ];

            $userData = [
                'role' => $input['role'] ?? null
            ];

            // Perform transaction update WITHOUT modifying password
            $this->employeeRepo->updateEmployeeWithAccountTransaction($id, $employeeData, $userData);

            $updatedEmployee = $this->employeeRepo->getById($id, $tenantId);

            ApiResponse::success($updatedEmployee, 'تم تحديث بيانات الموظف بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function getEmployees($tenantId, $companyId = null) {
        try {
            $list = $this->employeeRepo->getAllByTenant($tenantId, $companyId);
            ApiResponse::success($list, 'قائمة الموظفين');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getProfile($employeeId, $tenantId = null) {
        try {
            $employee = $this->employeeRepo->getById($employeeId, $tenantId);
            if (!$employee) {
                ApiResponse::error('الموظف غير موجود', 404);
                return;
            }

            $allowedLocations = [];
            if (!empty($employee['assigned_location_id'])) {
                $allowedLocations[] = (string)$employee['assigned_location_id'];
            } else {
                $allowedLocations[] = "1";
            }

            ApiResponse::success([
                'id' => (int)$employee['id'],
                'employee_number' => $employee['employee_number'],
                'first_name' => $employee['first_name'],
                'last_name' => $employee['last_name'],
                'email' => $employee['email'],
                'phone' => $employee['phone'] ?? '',
                'company_id' => (int)$employee['company_id'],
                'company_name' => $employee['company_name'] ?? '',
                'department_id' => (int)$employee['department_id'],
                'department_name' => $employee['department_name'] ?? '',
                'position_title' => $employee['position_title'] ?? '',
                'assigned_location_id' => (int)($employee['assigned_location_id'] ?? 1),
                'work_location_name' => $employee['work_location_name'] ?? '',
                'employment_status' => $employee['employment_status'],
                'officeStatus' => $employee['employment_status'],
                'account_enabled' => (bool)$employee['account_enabled'],
                'allowed_locations' => $allowedLocations
            ], 'بيانات الملف الشخصي');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function enableAccount($id, $tenantId) {
        try {
            $this->employeeRepo->setAccountStatus($id, $tenantId, true);
            ApiResponse::success(null, 'تم تفعيل حساب الموظف بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function disableAccount($id, $tenantId) {
        try {
            $this->employeeRepo->setAccountStatus($id, $tenantId, false);
            ApiResponse::success(null, 'تم تعطيل حساب الموظف بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function resetPassword($id, $input, $tenantId) {
        try {
            if (empty($input['password']) || strlen($input['password']) < 6) {
                ApiResponse::error('كلمة المرور يجب أن تكون 6 خانات على الأقل.', 400);
                return;
            }
            $this->employeeRepo->resetPassword($id, $tenantId, $input['password']);
            ApiResponse::success(null, 'تم إعادة تعيين كلمة المرور بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getWorkConfiguration($employeeId) {
        try {
            $employee = $this->employeeRepo->getById($employeeId);
            if (!$employee) {
                ApiResponse::error('الموظف غير موجود', 404);
                return;
            }

            $locationId = $employee['assigned_location_id'] ?? 1;
            $stmt = $this->db->prepare("SELECT * FROM work_locations WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $locationId]);
            $loc = $stmt->fetch();

            if (!$loc) {
                $stmt = $this->db->prepare("SELECT * FROM work_locations WHERE is_active = 1 LIMIT 1");
                $stmt->execute();
                $loc = $stmt->fetch();
            }

            ApiResponse::success([
                'schedule_name' => 'الجدول الرئيسي - Morning Shift',
                'shift_name' => 'الوردية الصباحية',
                'working_days' => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                'shift_start_time' => '08:00:00',
                'shift_end_time' => '17:00:00',
                'daily_hours_required' => 8.0,
                'weekly_hours_required' => 40.0,
                'location_name' => $loc ? $loc['name'] : 'المكتب الرئيسي',
                'latitude' => $loc ? (float)$loc['latitude'] : 24.7136,
                'longitude' => $loc ? (float)$loc['longitude'] : 46.6753,
                'geofence_radius' => $loc ? (float)$loc['radius_meters'] : 100.0,
                'remote_work_allowed' => false
            ], 'إعدادات موقع عمل الموظف');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getLeaveBalances($employeeId) {
        try {
            $stmt = $this->db->prepare("
                SELECT lt.name as leave_type, lt.code as leave_type_code, 
                       lb.opening_balance, lb.accrued_balance, lb.used_balance,
                       lb.pending_reserved_balance as pending_balance,
                       lb.available_balance as remaining_balance, lb.carried_forward_balance
                FROM leave_balances lb
                JOIN leave_types lt ON lb.leave_type_id = lt.id
                WHERE lb.employee_id = :empId
            ");
            $stmt->execute(['empId' => (int)$employeeId]);
            ApiResponse::success($stmt->fetchAll(), 'رصيد إجازات الموظف');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }
}
