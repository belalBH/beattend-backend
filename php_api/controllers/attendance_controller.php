<?php
/**
 * Attendance Controller - Log & Correction Workflow
 */
class AttendanceController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function getAttendance($tenantId, $employeeId = null, $startDate = null, $endDate = null) {
        try {
            $sql = "
                SELECT a.id, a.tenant_id, a.employee_id, a.check_in, a.check_out, a.location_name AS location, a.work_hours, a.status, a.created_at,
                       CONCAT(e.first_name, ' ', e.last_name) AS employee_name
                FROM attendance_sessions a
                INNER JOIN employees e ON a.employee_id = e.id
                WHERE a.tenant_id = :tenant_id
            ";
            $params = ['tenant_id' => $tenantId];

            if ($employeeId) {
                $sql .= " AND a.employee_id = :employee_id";
                $params['employee_id'] = (int)$employeeId;
            }

            $sql .= " ORDER BY a.id DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format date strings for UI display
            foreach ($logs as &$log) {
                if (!empty($log['check_in'])) {
                    $log['check_in'] = date('h:i A', strtotime($log['check_in']));
                }
                if (!empty($log['check_out'])) {
                    $log['check_out'] = date('h:i A', strtotime($log['check_out']));
                } else {
                    $log['check_out'] = '-';
                }
                $log['work_hours'] = ($log['work_hours'] ?? '8.0') . ' س';
            }

            ApiResponse::send($logs, 'تم استرجاع سجلات الحضور بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب سجلات الحضور: ' . $e->getMessage(), 500);
        }
    }

    public function checkIn($employeeId, $input, $tenantId) {
        try {
            $checkInTime = !empty($input['check_in']) ? $input['check_in'] : date('Y-m-d H:i:s');
            $location = !empty($input['location']) ? trim($input['location']) : 'Staging HQ';
            $status = !empty($input['status']) ? trim($input['status']) : 'حاضر في الموعد';

            $stmt = $this->db->prepare("
                INSERT INTO attendance_sessions (tenant_id, employee_id, check_in, location_name, work_hours, status, created_at)
                VALUES (:tenant_id, :employee_id, :check_in, :location, 8.50, :status, NOW())
            ");
            $stmt->execute([
                'tenant_id' => $tenantId,
                'employee_id' => $employeeId,
                'check_in' => $checkInTime,
                'location' => $location,
                'status' => $status
            ]);

            $newId = (int)$this->db->lastInsertId();

            $stmtFetch = $this->db->prepare("
                SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name 
                FROM attendance_sessions a
                INNER JOIN employees e ON a.employee_id = e.id
                WHERE a.id = :id
            ");
            $stmtFetch->execute(['id' => $newId]);
            $createdLog = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            ApiResponse::send($createdLog, 'تم تسجيل البصمة بنجاح', 201);
        } catch (Exception $e) {
            ApiResponse::error('فشل تسجيل البصمة: ' . $e->getMessage(), 500);
        }
    }

    public function correctFingerprint($id, $input, $tenantId) {
        try {
            $status = !empty($input['status']) ? trim($input['status']) : 'تم تصحيح البصمة';
            $stmt = $this->db->prepare("UPDATE attendance_sessions SET status = :status WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute(['status' => $status, 'id' => $id, 'tenant_id' => $tenantId]);

            $stmtFetch = $this->db->prepare("
                SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name 
                FROM attendance_sessions a
                INNER JOIN employees e ON a.employee_id = e.id
                WHERE a.id = :id
            ");
            $stmtFetch->execute(['id' => $id]);
            $updatedLog = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            ApiResponse::send($updatedLog, 'تم قبول وتصحيح البصمة بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل تصحيح البصمة: ' . $e->getMessage(), 500);
        }
    }
}
