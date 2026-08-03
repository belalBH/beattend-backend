<?php
/**
 * BeatAttend Native PHP REST API Engine - Single Point Entry Gateway
 * Router & Dispatcher for Multi-Tenant Modular Controllers
 */

error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-ID');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils/api_response.php';
require_once __DIR__ . '/controllers/health_controller.php';
require_once __DIR__ . '/controllers/companies_controller.php';
require_once __DIR__ . '/controllers/employee_controller.php';
require_once __DIR__ . '/controllers/attendance_controller.php';
require_once __DIR__ . '/controllers/leave_controller.php';
require_once __DIR__ . '/controllers/geofence_controller.php';
require_once __DIR__ . '/controllers/tenant_controller.php';
require_once __DIR__ . '/controllers/superadmin_controller.php';

function validateTenant() {
    $tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? $_GET['tenant_id'] ?? 'tenant-sol-102';
    if (empty($tenantId)) {
        ApiResponse::error('معرف المستأجر (Tenant ID) مطلوب', 400);
        exit;
    }
    return $tenantId;
}

function getAuthenticatedEmployeeId() {
    return isset($_GET['employee_id']) ? (int)$_GET['employee_id'] : 1;
}

$tenantId = validateTenant();
$method = $_SERVER['REQUEST_METHOD'];

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl = parse_url($requestUri);
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

        case 'tenant':
            $controller = new TenantController();
            $ident = $_GET['identifier'] ?? $_GET['tenant_id'] ?? 'hadiyah';
            $controller->resolveTenant($ident);
            break;

        case 'superadmin':
            $controller = new SuperAdminController();
            if ($action === 'tenants' && $method === 'POST') {
                $controller->onboardTenant($input);
            } elseif ($action === 'tenants' && ($method === 'PUT' || $method === 'PATCH')) {
                $targetTenantId = $_GET['tenant_id'] ?? $input['tenant_id'] ?? '';
                $controller->updateTenantStatus($targetTenantId, $input);
            } elseif ($action === 'plans') {
                $controller->getSubscriptionPlans();
            } else {
                $controller->getTenants();
            }
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
                if ($id) {
                    $controller->getEmployeeById($id, $tenantId);
                } else {
                    $companyId = isset($_GET['companyId']) ? (int)$_GET['companyId'] : null;
                    $controller->getEmployees($tenantId, $companyId);
                }
            }
            break;

        case 'geofences':
            $controller = new GeofenceController();
            if ($action === 'test') {
                $controller->testRadius($input);
            } elseif ($action === 'link_employees' && $id) {
                $controller->linkEmployees($id, $input, $tenantId);
            } elseif ($method === 'POST') {
                $controller->createGeofence($input, $tenantId);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->updateGeofence($targetId, $input, $tenantId);
            } elseif ($method === 'DELETE') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->deleteGeofence($targetId, $tenantId);
            } else {
                if ($id) {
                    $controller->getGeofenceById($id, $tenantId);
                } else {
                    $controller->getGeofences($tenantId);
                }
            }
            break;

        case 'attendance':
            $controller = new AttendanceController();
            if (!empty($action)) {
                $controller->handleAction($action, $tenantId, $id, $input);
            } elseif ($method === 'POST') {
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
