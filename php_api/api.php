<?php
/**
 * Time Attendance API
 * Routing Entry Point & Full CRUD Workflows
 */

require_once 'database.php';
require_once 'middleware/tenant_validation_middleware.php';
require_once 'controllers/auth_controller.php';
require_once 'controllers/companies_controller.php';
require_once 'controllers/health_controller.php';
require_once 'controllers/attendance_controller.php';
require_once 'controllers/leave_controller.php';
require_once 'controllers/dynamic_request_controller.php';
require_once 'controllers/employee_controller.php';

header('Content-Type: application/json; charset=UTF-8');

class ApiResponse {
    public static function send($data = null, $message = 'تمت العملية بنجاح', $code = 200, $success = true) {
        http_response_code($code);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error($message = 'حدث خطأ في النظام', $code = 400, $errors = null) {
        http_response_code($code);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function validateTenant() {
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }
    $tenantId = $headers['X-Tenant-ID'] ?? $headers['x-tenant-id'] ?? $_SERVER['HTTP_X_TENANT_ID'] ?? $_GET['tenant_id'] ?? 'tenant-sol-102';
    return $tenantId;
}

function getAuthenticatedEmployeeId() {
    $authHeader = '';
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $payload = json_decode(base64_decode($token), true);
        if (isset($payload['userId'])) {
            return (int)$payload['userId'];
        }
    }
    return 1;
}

$tenantId = validateTenant();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '';
$parsedUrl = parse_url($uri);
$path = trim($parsedUrl['path'] ?? '', '/');
$route = $_GET['route'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? '';

if (empty($route)) {
    $parts = explode('/', $path);
    $routeIndex = array_search('api.php', $parts);
    if ($routeIndex !== false && isset($parts[$routeIndex + 1])) {
        $route = $parts[$routeIndex + 1];
    }
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    switch ($route) {
        case 'health':
        case 'ping':
            $controller = new HealthController();
            $controller->check();
            break;
            
        case 'companies':
            $controller = new CompaniesController();
            if ($method === 'POST') {
                $controller->createCompany($input, $tenantId);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->updateCompany($targetId, $input, $tenantId);
            } elseif ($method === 'DELETE') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->deleteCompany($targetId, $tenantId);
            } else {
                $controller->getCompanies($tenantId);
            }
            break;

        case 'employees':
            $controller = new EmployeeController();
            if ($method === 'POST') {
                $controller->createEmployee($input, $tenantId);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->updateEmployee($targetId, $input, $tenantId);
            } elseif ($method === 'DELETE') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->deleteEmployee($targetId, $tenantId);
            } else {
                $companyId = isset($_GET['companyId']) ? (int)$_GET['companyId'] : null;
                $controller->getEmployees($tenantId, $companyId);
            }
            break;

        case 'attendance':
            $controller = new AttendanceController();
            if ($method === 'POST') {
                if ($action === 'correct' && $id) {
                    $controller->correctFingerprint($id, $input, $tenantId);
                } else {
                    $employeeId = getAuthenticatedEmployeeId();
                    $controller->checkIn($employeeId, $input, $tenantId);
                }
            } elseif ($method === 'PUT') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->correctFingerprint($targetId, $input, $tenantId);
            } else {
                $employeeId = isset($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
                $startDate = $_GET['start_date'] ?? null;
                $endDate = $_GET['end_date'] ?? null;
                $controller->getAttendance($tenantId, $employeeId, $startDate, $endDate);
            }
            break;

        case 'leaves':
            $controller = new LeaveController();
            if (!empty($action) && $id) {
                $controller->updateLeaveStatus($id, $action, $input['reason'] ?? '', $tenantId);
            } elseif ($method === 'POST') {
                $employeeId = getAuthenticatedEmployeeId();
                $controller->createLeaveRequest($employeeId, $input, $tenantId);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $act = $input['action'] ?? 'approve';
                $controller->updateLeaveStatus($targetId, $act, $input['reason'] ?? '', $tenantId);
            } else {
                $employeeId = isset($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
                $status = $_GET['status'] ?? null;
                $controller->getLeaveRequests($tenantId, $employeeId, $status);
            }
            break;

        default:
            ApiResponse::send([
                'status' => 'online',
                'service' => 'BeatAttend Native PHP REST Engine',
                'timestamp' => date('Y-m-d H:i:s')
            ], 'مرحباً بك في الباك إند الرسمي لـ BeatAttend');
    }
} catch (Exception $e) {
    ApiResponse::error($e->getMessage(), 500);
}
