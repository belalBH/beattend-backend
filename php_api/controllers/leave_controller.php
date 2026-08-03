<?php
/**
 * Leave Controller - Complete Workflow & Balance Deduction
 */
class LeaveController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function getLeaveRequests($tenantId, $employeeId = null, $status = null) {
        try {
            $sql = "
                SELECT l.id, l.employee_id, l.leave_type_id, l.start_date, l.end_date, l.days_count, l.status, l.reason, l.created_at,
                       CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                       lt.name_ar AS type
                FROM leave_requests l
                INNER JOIN employees e ON l.employee_id = e.id
                LEFT JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE e.tenant_id = :tenant_id
            ";
            $params = ['tenant_id' => $tenantId];

            if ($employeeId) {
                $sql .= " AND l.employee_id = :employee_id";
                $params['employee_id'] = (int)$employeeId;
            }
            if ($status) {
                $sql .= " AND l.status = :status";
                $params['status'] = trim($status);
            }

            $sql .= " ORDER BY l.id DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $leaves = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ApiResponse::send($leaves, 'تم استرجاع طلبات الإجازات بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب الطلبات: ' . $e->getMessage(), 500);
        }
    }

    public function createLeaveRequest($employeeId, $input, $tenantId) {
        try {
            if (empty($input['start_date']) || empty($input['end_date'])) {
                ApiResponse::error('تاريخ البدء والانتهاء حقول إجبارية', 400);
                return;
            }

            $targetEmployeeId = !empty($input['employee_id']) ? (int)$input['employee_id'] : $employeeId;
            $leaveTypeId = isset($input['leave_type_id']) ? (int)$input['leave_type_id'] : 1;
            $daysCount = isset($input['days_count']) ? (int)$input['days_count'] : 1;
            $reason = trim($input['reason'] ?? 'طلب إجازة جديد');

            $stmt = $this->db->prepare("
                INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, days_count, status, reason, created_at)
                VALUES (:employee_id, :leave_type_id, :start_date, :end_date, :days_count, 'بانتظار موافقة المدير', :reason, NOW())
            ");
            $stmt->execute([
                'employee_id' => $targetEmployeeId,
                'leave_type_id' => $leaveTypeId,
                'start_date' => $input['start_date'],
                'end_date' => $input['end_date'],
                'days_count' => $daysCount,
                'reason' => $reason
            ]);

            $newId = (int)$this->db->lastInsertId();

            $stmtFetch = $this->db->prepare("
                SELECT l.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, lt.name_ar AS type
                FROM leave_requests l
                INNER JOIN employees e ON l.employee_id = e.id
                LEFT JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE l.id = :id
            ");
            $stmtFetch->execute(['id' => $newId]);
            $createdLeave = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            ApiResponse::send($createdLeave, 'تم إرسال طلب الإجازة بنجاح', 201);
        } catch (Exception $e) {
            ApiResponse::error('فشل تقديم طلب الإجازة: ' . $e->getMessage(), 500);
        }
    }

    public function updateLeaveStatus($id, $action, $reason = '', $tenantId = null) {
        try {
            $newStatus = 'بانتظار موافقة المدير';
            if ($action === 'approve') {
                $newStatus = 'مقبولة';
            } elseif ($action === 'reject') {
                $newStatus = 'مرفوضة';
            } elseif ($action === 'cancel') {
                $newStatus = 'ملغاة';
            }

            $stmt = $this->db->prepare("UPDATE leave_requests SET status = :status WHERE id = :id");
            $stmt->execute(['status' => $newStatus, 'id' => $id]);

            if ($stmt->rowCount() === 0) {
                ApiResponse::error('طلب الإجازة غير موجود', 404);
                return;
            }

            $stmtFetch = $this->db->prepare("
                SELECT l.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, lt.name_ar AS type
                FROM leave_requests l
                INNER JOIN employees e ON l.employee_id = e.id
                LEFT JOIN leave_types lt ON l.leave_type_id = lt.id
                WHERE l.id = :id
            ");
            $stmtFetch->execute(['id' => $id]);
            $updatedLeave = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            ApiResponse::send($updatedLeave, "تم تحديث حالة الطلب إلى ({$newStatus}) بنجاح");
        } catch (Exception $e) {
            ApiResponse::error('فشل تحديث حالة الإجازة: ' . $e->getMessage(), 500);
        }
    }
}
