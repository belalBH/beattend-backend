<?php
/**
 * BeatAttend Native PHP REST API Engine - Single Point Entry Gateway
 * Router & Dispatcher for Platform Super Admin & Multi-Tenant Modular Controllers
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
require_once __DIR__ . '/controllers/platform_auth_controller.php';
require_once __DIR__ . '/controllers/platform_analytics_controller.php';
require_once __DIR__ . '/controllers/platform_plans_controller.php';
require_once __DIR__ . '/controllers/platform_subscriptions_controller.php';
require_once __DIR__ . '/controllers/platform_users_controller.php';
require_once __DIR__ . '/controllers/platform_support_controller.php';
require_once __DIR__ . '/controllers/platform_settings_controller.php';
require_once __DIR__ . '/controllers/tenant_rbac_controller.php';
require_once __DIR__ . '/controllers/universal_approval_controller.php';
require_once __DIR__ . '/controllers/tenant_settings_controller.php';
require_once __DIR__ . '/controllers/payroll_controller.php';
require_once __DIR__ . '/controllers/payroll_engine_controller.php';

function validateTenant() {
    $tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? $_GET['tenant_id'] ?? 'tenant-sol-102';
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

// Helper middleware for Feature Entitlement check
function enforceTenantFeature($tenantId, $featureCode) {
    $features = TenantRbacController::getEnabledFeatures($tenantId);
    if (!isset($features[$featureCode]) || !$features[$featureCode]) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'code' => 403,
            'message' => "⚠️ 403 Feature Not Enabled: وحدة ({$featureCode}) غير مفعلة في اشتراك هذه المنشأة",
            'errors' => ['FEATURE_NOT_ENABLED'],
            'timestamp' => date('c')
        ]);
        exit;
    }
}

try {
    switch ($route) {
        case 'health':
        case 'ping':
            $controller = new HealthController();
            $controller->check();
            break;

        case 'tenant':
        case 'tenant_resolve':
            $controller = new TenantController();
            $identifier = $_GET['identifier'] ?? $_GET['code'] ?? $_GET['slug'] ?? '';
            $controller->resolveTenant($identifier);
            break;

        case 'companies':
            $controller = new CompaniesController();
            if ($method === 'POST') {
                $controller->createCompany($input);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->updateCompany($targetId, $input);
            } elseif ($method === 'DELETE') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->deleteCompany($targetId);
            } else {
                if ($id) {
                    $controller->getCompanyById($id);
                } else {
                    $controller->getCompanies($tenantId);
                }
            }
            break;

        // ---------------------------------------------------------
        // PLATFORM SUPER ADMIN NAMESPACE (/api/platform/*)
        // ---------------------------------------------------------
        case 'platform_auth_login':
            $controller = new PlatformAuthController();
            $controller->login($input);
            break;

        case 'platform_auth_logout':
            $controller = new PlatformAuthController();
            $controller->logout();
            break;

        case 'platform_auth_me':
            $controller = new PlatformAuthController();
            $controller->me();
            break;

        case 'platform_analytics':
            $controller = new PlatformAnalyticsController();
            $controller->getExecutiveMetrics();
            break;

        case 'platform_plans':
            $controller = new PlatformPlansController();
            if ($method === 'POST') {
                $controller->createPlan($input);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->updatePlan($targetId, $input);
            } elseif ($method === 'DELETE') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->deletePlan($targetId);
            } else {
                $controller->getPlans();
            }
            break;

        case 'platform_subscriptions':
            $controller = new PlatformSubscriptionsController();
            if ($action === 'renew' && $method === 'POST') {
                $controller->renewSubscription($input);
            } else {
                $controller->getSubscriptions();
            }
            break;

        case 'platform_users':
            $controller = new PlatformUsersController();
            if ($method === 'POST') {
                $controller->createUser($input);
            } else {
                $controller->getUsers();
            }
            break;

        case 'platform_support':
            $controller = new PlatformSupportController();
            if ($method === 'POST') {
                $controller->createTicket($input);
            } else {
                $controller->getTickets();
            }
            break;

        case 'platform_settings':
            $controller = new PlatformSettingsController();
            if ($method === 'POST' || $method === 'PUT') {
                $controller->updateSettings($input);
            } else {
                $controller->getSettings();
            }
            break;

        case 'platform_tenants':
            $controller = new PlatformController();
            $targetTenantId = $_GET['tenant_id'] ?? ($input['tenant_id'] ?? null);

            if ($action === 'detail' && $targetTenantId) {
                $controller->getTenantDetail($targetTenantId);
            } elseif ($action === 'status' && $targetTenantId) {
                $controller->updateTenantStatus($targetTenantId, $input['status'] ?? 'active');
            } elseif ($action === 'renew' && $targetTenantId) {
                $controller->updateTenantSubscription($targetTenantId, $input);
            } elseif ($action === 'basic' && $targetTenantId) {
                $controller->updateTenantBasicInfo($targetTenantId, $input);
            } elseif ($method === 'POST') {
                $controller->createTenant($input);
            } else {
                $controller->getTenants();
            }
            break;

        // ---------------------------------------------------------
        // TENANT USER & RBAC NAMESPACE (/api/tenant/*)
        // ---------------------------------------------------------
        case 'auth_login':
        case 'login':
        case 'tenant_auth_login':
            $controller = new AuthController();
            $controller->login($input);
            break;

        case 'tenant_auth_me':
            $membershipId = (int)($_GET['membership_id'] ?? 1);
            $effectivePerms = TenantRbacController::getEffectivePermissions($membershipId);
            $dataScope = TenantRbacController::getDataScope($membershipId);
            $features = TenantRbacController::getEnabledFeatures($tenantId);

            ApiResponse::success([
                'user' => ['id' => 1, 'email' => 'user@company.com', 'full_name' => 'User'],
                'tenant' => ['tenant_id' => $tenantId],
                'permissions' => $effectivePerms,
                'enabled_features' => $features,
                'data_scope' => $dataScope
            ], 'تم استرجاع صلاحيات ونطاق المستخدم بنجاح');
            break;

        case 'tenant_users':
            enforceTenantFeature($tenantId, 'settings');
            $controller = new TenantRbacController();
            if ($method === 'POST') {
                $controller->createUser($tenantId, $input);
            } else {
                $controller->getUsers($tenantId);
            }
            break;

        case 'tenant_roles':
            enforceTenantFeature($tenantId, 'settings');
            $controller = new TenantRbacController();
            if ($method === 'POST') {
                $controller->createRole($tenantId, $input);
            } else {
                $controller->getRoles($tenantId);
            }
            break;

        case 'tenant_permissions_modules':
            $controller = new TenantRbacController();
            $controller->getModulesAndPermissions();
            break;

        case 'tenant_workflows':
            $controller = new UniversalApprovalController();
            if ($method === 'POST') {
                $controller->createWorkflow($tenantId, $input);
            } else {
                $controller->getWorkflows($tenantId);
            }
            break;

        case 'tenant_approvals_submit':
            $controller = new UniversalApprovalController();
            $memId = (int)($input['membership_id'] ?? 1);
            $controller->submitRequest($tenantId, $memId, $input);
            break;

        case 'tenant_approvals_action':
            $controller = new UniversalApprovalController();
            $memId = (int)($input['membership_id'] ?? 1);
            $controller->processAction($memId, $input);
            break;

        case 'tenant_settings':
            $controller = new TenantSettingsController();
            $controller->getFullSettings($tenantId);
            break;

        case 'tenant_leave_types':
        case 'leave_types':
            $controller = new TenantSettingsController();
            if ($method === 'POST') {
                $controller->createLeaveType($tenantId, $input);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->updateLeaveType($targetId, $input);
            } else {
                $controller->getLeaveTypes($tenantId);
            }
            break;

        // Legacy / Standard Modules with Feature Entitlements Enforced
        case 'employees':
            enforceTenantFeature($tenantId, 'employees');
            $controller = new EmployeeController();
            if ($method === 'POST') {
                $controller->createEmployee($input, $tenantId);
            } elseif ($method === 'PUT' || $method === 'PATCH') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->updateEmployee($targetId, $input, $tenantId);
            } elseif ($method === 'DELETE') {
                $targetId = $id ?: ($input['id'] ?? null);
                $controller->deleteEmployee($tenantId, $tenantId);
            } else {
                if ($id) {
                    $controller->getEmployeeById($id, $tenantId);
                } else {
                    $controller->getEmployees($tenantId);
                }
            }
            break;

        case 'attendance':
            enforceTenantFeature($tenantId, 'attendance');
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
            enforceTenantFeature($tenantId, 'leaves');
            $controller = new LeaveController();
            if ($action === 'types') {
                $settingController = new TenantSettingsController();
                $settingController->getLeaveTypes($tenantId);
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
            enforceTenantFeature($tenantId, 'geofencing');
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

        case 'payroll_engine_tests':
            enforceTenantFeature($tenantId, 'payroll');
            $controller = new PayrollEngineController();
            $controller->runPhase1Tests();
            break;

        case 'payroll':
            enforceTenantFeature($tenantId, 'payroll');
            $controller = new PayrollController();
            if ($action === 'detail') {
                $runId = $_GET['run_id'] ?? 101;
                $controller->getPayrollRunDetail($tenantId, $runId);
            } elseif ($action === 'mudad') {
                $runId = $_GET['run_id'] ?? 101;
                $controller->generateMudadFile($tenantId, $runId);
            } else {
                $controller->getPayrollRuns($tenantId);
            }
            break;

        default:
            ApiResponse::error("المسار غير معروف: {$route}", 404);
            break;
    }
} catch (Exception $e) {
    ApiResponse::error("خطأ داخلي في الخادم: " . $e->getMessage(), 500);
}
