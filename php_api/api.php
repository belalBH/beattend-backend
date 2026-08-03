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
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-ID, X-Platform-Token');

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
require_once __DIR__ . '/controllers/auth_controller.php';
require_once __DIR__ . '/controllers/platform_controller.php';
require_once __DIR__ . '/controllers/invitation_controller.php';

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

        case 'auth_login':
        case 'login':
            $controller = new AuthController();
            $controller->login($input);
            break;

        case 'platform_tenants':
            $controller = new PlatformController();
            if ($method === 'POST') {
                $controller->createTenant($input);
            } else {
                $controller->getTenants();
            }
            break;

        case 'invitation_verify':
            $controller = new InvitationController();
            $controller->verifyToken($_GET['token'] ?? '');
            break;

        case 'invitation_activate':
            $controller = new InvitationController();
            $controller->activateAccount($input);
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
                if ($id) {
                    $controller->getCompanyById($id, $tenantId);
                } else {
                    $controller->getCompanies($tenantId);
                }
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
                    $controller->getEmployees($tenantId);
                }
            }
            break;

        case 'attendance':
            $controller = new AttendanceController();
            if ($action === 'checkin' && $method === 'POST') {
                $empId = getAuthenticatedEmployeeId();
                $controller->checkIn($empId, $input, $tenantId);
            } elseif ($action === 'checkout' && $method === 'POST') {
                $empId = getAuthenticatedEmployeeId();
                $controller->checkOut($empId, $input, $tenantId);
            } elseif ($action === 'logs') {
                $empId = getAuthenticatedEmployeeId();
                $controller->getLogs($empId, $tenantId);
            } else {
                $controller->getDashboardStats($tenantId);
            }
            break;

        case 'leaves':
            $controller = new LeaveController();
            if ($action === 'types') {
                $controller->getLeaveTypes();
            } elseif ($action === 'create' && $method === 'POST') {
                $empId = getAuthenticatedEmployeeId();
                $controller->createLeaveRequest($empId, $input);
            } elseif (($action === 'approve' || $action === 'reject') && $method === 'POST') {
                $reqId = $id ?: ($input['request_id'] ?? null);
                $status = ($action === 'approve') ? 'Approved' : 'Rejected';
                $controller->updateLeaveStatus($reqId, $status);
            } else {
                $empId = isset($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
                $controller->getLeaveRequests($empId);
            }
            break;

        case 'geofences':
            $controller = new GeofenceController();
            if ($action === 'verify' && $method === 'POST') {
                $controller->verifyLocation($input, $tenantId);
            } elseif ($action === 'link' && $method === 'POST') {
                $controller->linkEmployees($input, $tenantId);
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

        default:
            ApiResponse::error("المسار غير معروف: {$route}", 404);
            break;
    }
} catch (Exception $e) {
    ApiResponse::error("خطأ داخلي في الخادم: " . $e->getMessage(), 500);
}
