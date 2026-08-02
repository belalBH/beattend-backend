<?php
/**
 * Time Attendance API
 * Routing Entry Point
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

// Set response content type
header('Content-Type: application/json; charset=UTF-8');

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
    return 1; // Fallback default
}

// Get request parameters
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? $_SERVER['REQUEST_URI'] ?? '/';

// Parse query strings out
$pathParts = explode('?', $path);
$cleanPath = trim($pathParts[0], '/');

// Strip /api/v1 or /api/v2 or /api prefix if present
if (strpos($cleanPath, 'api/v1') === 0) {
    $cleanPath = substr($cleanPath, 6);
} elseif (strpos($cleanPath, 'api/v2') === 0) {
    $cleanPath = substr($cleanPath, 6);
} elseif (strpos($cleanPath, 'api') === 0) {
    $cleanPath = substr($cleanPath, 3);
}
$cleanPath = trim($cleanPath, '/');
$segments = explode('/', $cleanPath);

$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    $dbConnection = Database::getInstance()->getConnection();
    
    // Routing
    switch ($segments[0]) {
        case 'health':
            $controller = new HealthController($dbConnection);
            $controller->check();
            break;

        case 'companies':
            $controller = new CompaniesController($dbConnection);
            if (isset($segments[1]) && $segments[1] === 'validate') {
                $domain = $_GET['domain'] ?? '';
                $controller->validate($domain);
            } else {
                $controller->getCompanies();
            }
            break;

        case 'login':
            $controller = new AuthController($dbConnection);
            $controller->login($input);
            break;

        case 'logout':
            $controller = new AuthController($dbConnection);
            $controller->logout($input);
            break;
            
        case 'attendance':
            $tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? $_SERVER['HTTP_X_tenant_id'] ?? 'tenant-sol-102';
            $controller = new AttendanceController($dbConnection);
            
            if (isset($segments[1]) && $segments[1] === 'events') {
                $controller->punch($input, $tenantId);
            } elseif (isset($segments[1]) && $segments[1] === 'current-session') {
                $employeeId = $_GET['employeeId'] ?? 0;
                $controller->getCurrentSession($employeeId, $tenantId);
            } elseif (isset($segments[1]) && $segments[1] === 'sessions') {
                if (isset($segments[2]) && is_numeric($segments[2])) {
                    $controller->getSessionDetails((int)$segments[2]);
                } else {
                    $employeeId = $_GET['employeeId'] ?? 0;
                    $start = $_GET['startDate'] ?? '';
                    $end = $_GET['endDate'] ?? '';
                    $controller->getSessions($employeeId, $start, $end);
                }
            } elseif (isset($segments[1]) && $segments[1] === 'calendar') {
                $employeeId = $_GET['employeeId'] ?? 0;
                $start = $_GET['startDate'] ?? '';
                $end = $_GET['endDate'] ?? '';
                $controller->getCalendar($employeeId, $start, $end);
            } elseif (isset($segments[1]) && $segments[1] === 'corrections') {
                if (isset($segments[2]) && is_numeric($segments[2])) {
                    $id = (int)$segments[2];
                    if (isset($segments[3]) && $segments[3] === 'manager-action') {
                        $controller->managerAction($id, $input, $tenantId);
                    } elseif (isset($segments[3]) && $segments[3] === 'hr-action') {
                        $controller->hrAction($id, $input, $tenantId);
                    } else {
                        ApiResponse::error('مسار غير صحيح', 404);
                    }
                } else {
                    if ($method === 'POST') {
                        $controller->createCorrection($input, $tenantId);
                    } else {
                        $employeeId = $_GET['employeeId'] ?? 0;
                        $controller->getCorrections($employeeId, $tenantId);
                    }
                }
            } elseif (isset($segments[1]) && $segments[1] === 'work-locations') {
                $controller->getWorkLocations($tenantId);
            } elseif (isset($segments[1]) && $segments[1] === 'policy') {
                $controller->getPolicy($tenantId);
            } else {
                ApiResponse::error('مسار غير صحيح', 404);
            }
            break;
            
        case 'leaves':
            $tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? $_SERVER['HTTP_X_tenant_id'] ?? 'tenant-sol-102';
            $controller = new LeaveController($dbConnection);
            
            if (isset($segments[1]) && $segments[1] === 'types') {
                $controller->getTypes($tenantId);
            } elseif (isset($segments[1]) && $segments[1] === 'policies') {
                $controller->getPolicies($tenantId);
            } elseif (isset($segments[1]) && $segments[1] === 'balances') {
                if (isset($segments[2]) && is_numeric($segments[2]) && isset($segments[3]) && $segments[3] === 'transactions') {
                    $controller->getTransactions((int)$segments[2], (int)($_GET['leaveTypeId'] ?? 1));
                } else {
                    $employeeId = $_GET['employeeId'] ?? 1;
                    $controller->getBalances($employeeId);
                }
            } elseif (isset($segments[1]) && $segments[1] === 'calculate') {
                $controller->calculateLeave($input);
            } elseif (isset($segments[1]) && $segments[1] === 'calendar') {
                $employeeId = $_GET['employeeId'] ?? 1;
                $controller->getLeaveCalendar($employeeId, $tenantId);
            } elseif (isset($segments[1]) && $segments[1] === 'requests') {
                if (isset($segments[2]) && is_numeric($segments[2])) {
                    $id = (int)$segments[2];
                    if (isset($segments[3]) && $segments[3] === 'manager-action') {
                        $controller->managerAction($id, $input);
                    } elseif (isset($segments[3]) && $segments[3] === 'hr-action') {
                        $controller->hrAction($id, $input);
                    } elseif (isset($segments[3]) && $segments[3] === 'cancel') {
                        $controller->cancelRequest($id, $input);
                    } else {
                        if ($method === 'PATCH') {
                            $controller->patchRequest($id, $input);
                        } else {
                            $controller->getRequestDetails($id);
                        }
                    }
                } else {
                    if ($method === 'POST') {
                        $controller->createRequest($input, $tenantId);
                    } else {
                        $approverId = $_GET['approverId'] ?? 2;
                        $type = $_GET['type'] ?? 'manager';
                        $controller->getPendingApprovals($approverId, $type);
                    }
                }
            } elseif (isset($segments[1]) && $segments[1] === 'attachments') {
                if (isset($segments[2]) && $segments[2] === 'upload') {
                    $controller->uploadAttachment();
                } else {
                    $controller->downloadAttachment();
                }
            } else {
                ApiResponse::error('مسار غير صحيح', 404);
            }
            break;
            
        case 'requests':
            $tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? $_SERVER['HTTP_X_tenant_id'] ?? 'tenant-sol-102';
            $controller = new DynamicRequestController($dbConnection);
            
            if (isset($segments[1]) && $segments[1] === 'types') {
                if (isset($segments[2]) && $segments[2] === 'fields') {
                    $controller->getFields((int)$segments[1]); // using segment[2] or types/{id}/fields
                } elseif (isset($segments[2]) && is_numeric($segments[2])) {
                    if (isset($segments[3]) && $segments[3] === 'fields') {
                        $controller->getFields((int)$segments[2]);
                    }
                } else {
                    $controller->getRequestTypes($tenantId);
                }
            } elseif (isset($segments[1]) && $segments[1] === 'drafts') {
                if ($method === 'POST') {
                    $controller->createDraft($input, $tenantId);
                }
            } elseif (isset($segments[1]) && is_numeric($segments[1])) {
                $id = (int)$segments[1];
                if (isset($segments[2]) && $segments[2] === 'submit') {
                    $controller->submitRequest($id);
                } elseif (isset($segments[2]) && $segments[2] === 'cancel') {
                    $controller->cancelRequest($id, $input);
                } elseif (isset($segments[2]) && $segments[2] === 'resubmit') {
                    $controller->resubmitRequest($id, $input);
                } elseif (isset($segments[2]) && $segments[2] === 'timeline') {
                    $controller->getTimeline($id);
                } elseif (isset($segments[2]) && $segments[2] === 'comments') {
                    if ($method === 'POST') {
                        $controller->addComment($id, $input, $tenantId);
                    } else {
                        $controller->getComments($id);
                    }
                }
            }
            break;

        case 'approvals':
            $tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? $_SERVER['HTTP_X_tenant_id'] ?? 'tenant-sol-102';
            $controller = new DynamicRequestController($dbConnection);
            
            if (isset($segments[1]) && $segments[1] === 'pending') {
                $approverId = $_GET['approverId'] ?? 2;
                $role = $_GET['role'] ?? 'manager';
                $controller->getPendingApprovals($approverId, $role);
            } elseif (isset($segments[1]) && is_numeric($segments[1])) {
                $id = (int)$segments[1];
                if (isset($segments[2]) && $segments[2] === 'approve') {
                    $controller->approveAction($id, $input);
                } elseif (isset($segments[2]) && $segments[2] === 'reject') {
                    $controller->rejectAction($id, $input);
                } elseif (isset($segments[2]) && $segments[2] === 'return') {
                    $controller->returnAction($id, $input);
                } elseif (isset($segments[2]) && $segments[2] === 'delegate') {
                    $controller->delegateAction($id, $input);
                } else {
                    $controller->getApprovalDetails($id);
                }
            }
            break;

        case 'financials':
            ApiResponse::success([], 'مستندات العمليات المالية وقروض الموظفين');
            break;

        case 'assets':
            ApiResponse::success([], 'إدارة أصول وعهود الموظفين');
            break;
            
        case 'employee':
        case 'employees':
            $tenantId = $_SERVER['HTTP_X_TENANT_ID'] ?? $_SERVER['HTTP_X_tenant_id'] ?? 'tenant-sol-102';
            $employeeId = getAuthenticatedEmployeeId();
            $controller = new EmployeeController($dbConnection);
            
            if (isset($segments[1]) && $segments[1] === 'me') {
                if (isset($segments[2]) && $segments[2] === 'work-configuration') {
                    $controller->getWorkConfiguration($employeeId);
                } elseif (isset($segments[2]) && $segments[2] === 'leave-balances') {
                    $controller->getLeaveBalances($employeeId);
                } else {
                    $controller->getProfile($employeeId, $tenantId);
                }
            } elseif (isset($segments[1]) && is_numeric($segments[1])) {
                $targetId = (int)$segments[1];
                if (isset($segments[2]) && $segments[2] === 'enable-account') {
                    $controller->enableAccount($targetId, $tenantId);
                } elseif (isset($segments[2]) && $segments[2] === 'disable-account') {
                    $controller->disableAccount($targetId, $tenantId);
                } elseif (isset($segments[2]) && $segments[2] === 'reset-password') {
                    $controller->resetPassword($targetId, $input, $tenantId);
                } elseif ($method === 'PUT' || $method === 'PATCH' || $method === 'POST') {
                    $controller->updateEmployee($targetId, $input, $tenantId);
                } else {
                    $controller->getProfile($targetId, $tenantId);
                }
            } else {
                if ($method === 'POST') {
                    $controller->createEmployee($input, $tenantId);
                } else {
                    $companyId = isset($_GET['companyId']) ? (int)$_GET['companyId'] : null;
                    $controller->getEmployees($tenantId, $companyId);
                }
            }
            break;
            
        default:
            ApiResponse::error('مسار غير صحيح', 404);
    }
} catch (Exception $e) {
    ApiResponse::error($e->getMessage(), 500);
}
