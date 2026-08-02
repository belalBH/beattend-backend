<?php
/**
 * Attendance Controller
 */
require_once __DIR__ . '/../validators/attendance_validator.php';
require_once __DIR__ . '/../services/attendance_service.php';
require_once __DIR__ . '/../repositories/attendance_repository.php';

class AttendanceController {
    private $db;
    private $service;
    private $repo;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->service = new AttendanceService($dbConnection);
        $this->repo = new AttendanceRepository($dbConnection);
    }

    public function punch($input, $tenantId) {
        try {
            $validation = AttendanceValidator::validatePunch($this->db, $input, $tenantId);

            if ($validation['duplicate']) {
                // If same idempotency UUID is processed, return the original result
                $existingEvent = $validation['event'];
                $session = $this->repo->getSessionById($existingEvent['sessionId']);
                ApiResponse::success([
                    'session' => $session,
                    'event' => $existingEvent,
                    'isDuplicate' => true
                ], 'تم معالجة هذا الحدث مسبقاً بنجاح.');
                return;
            }

            $session = $this->service->processPunchEvent($input, $tenantId);

            ApiResponse::success([
                'session' => $session,
                'isDuplicate' => false
            ], 'تم تسجيل عملية الحضور بنجاح.');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function getCurrentSession($employeeId, $tenantId) {
        $date = date('Y-m-d');
        $session = $this->repo->findSessionForDate($employeeId, $date);
        
        if ($session) {
            $events = $this->repo->getSessionEvents($session['sessionId']);
            ApiResponse::success([
                'session' => $session,
                'events' => $events
            ], 'بيانات الجلسة الحالية');
        } else {
            ApiResponse::success(null, 'لا توجد جلسة حضور نشطة اليوم');
        }
    }

    public function getSessions($employeeId, $startDate, $endDate) {
        $sessions = $this->repo->getSessionsFiltered($employeeId, $startDate, $endDate);
        ApiResponse::success($sessions, 'سجل الجلسات');
    }

    public function getSessionDetails($sessionId) {
        $session = $this->repo->getSessionById($sessionId);
        if ($session) {
            $events = $this->repo->getSessionEvents($sessionId);
            ApiResponse::success([
                'session' => $session,
                'events' => $events
            ], 'تفاصيل الجلسة والخط الزمني');
        } else {
            ApiResponse::error('الجلسة المطلوبة غير موجودة', 404);
        }
    }

    public function getCalendar($employeeId, $startDate, $endDate) {
        $records = $this->repo->getCalendarStatus($employeeId, $startDate, $endDate);
        ApiResponse::success($records, 'حالة تقويم الحضور');
    }

    public function createCorrection($input, $tenantId) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO attendance_corrections (
                    sessionId, tenantId, employeeId, requestedChanges, employeeReason
                ) VALUES (
                    :sessionId, :tenantId, :employeeId, :requestedChanges, :employeeReason
                )
            ");
            $stmt->execute([
                'sessionId' => $input['sessionId'],
                'tenantId' => $tenantId,
                'employeeId' => $input['employeeId'],
                'requestedChanges' => json_encode($input['requestedChanges']),
                'employeeReason' => $input['employeeReason'] ?? ''
            ]);
            ApiResponse::success(['id' => $this->db->lastInsertId()], 'تم تقديم طلب التصحيح بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getCorrections($employeeId, $tenantId) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM attendance_corrections 
                WHERE employeeId = :empId AND tenantId = :tenant
            ");
            $stmt->execute(['empId' => $employeeId, 'tenant' => $tenantId]);
            ApiResponse::success($stmt->fetchAll(), 'قائمة طلبات التصحيح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function managerAction($id, $input, $tenantId) {
        try {
            $stmt = $this->db->prepare("
                UPDATE attendance_corrections 
                SET managerDecision = :decision 
                WHERE id = :id AND tenantId = :tenant
            ");
            $stmt->execute([
                'decision' => $input['decision'],
                'id' => $id,
                'tenant' => $tenantId
            ]);
            ApiResponse::success(null, 'تم حفظ قرار المدير المباشر بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function hrAction($id, $input, $tenantId) {
        try {
            $stmt = $this->db->prepare("
                UPDATE attendance_corrections 
                SET hrDecision = :decision, approvedValues = :vals 
                WHERE id = :id AND tenantId = :tenant
            ");
            $stmt->execute([
                'decision' => $input['decision'],
                'vals' => json_encode($input['approvedValues'] ?? []),
                'id' => $id,
                'tenant' => $tenantId
            ]);
            ApiResponse::success(null, 'تم حفظ واعتماد قرار الموارد البشرية بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getWorkLocations($tenantId) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM work_locations WHERE tenant_id = :tenant AND is_active = 1");
            $stmt->execute(['tenant' => $tenantId]);
            ApiResponse::success($stmt->fetchAll(), 'مواقع العمل النشطة');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getPolicy($tenantId) {
        $tenantConfig = require __DIR__ . '/../config/tenant_config.php';
        ApiResponse::success($tenantConfig['features'] ?? [], 'قائمة سياسات التبصيم الفعالة');
    }
}
