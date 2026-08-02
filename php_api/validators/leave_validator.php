<?php
/**
 * Leave Validator Class
 */
class LeaveValidator {
    public static function validateRequest($db, $input, $tenantId) {
        $employeeId = $input['employeeId'] ?? null;
        $leaveTypeId = $input['leaveTypeId'] ?? null;
        $startDate = $input['startDate'] ?? null;
        $endDate = $input['endDate'] ?? null;

        if (!$employeeId || !$leaveTypeId || !$startDate || !$endDate) {
            throw new Exception("البيانات المطلوبة لطلب الإجازة ناقصة.", 400);
        }

        // 1. Verify employee is active
        $stmt = $db->prepare("SELECT * FROM employees WHERE id = :id AND tenant_id = :tenant LIMIT 1");
        $stmt->execute(['id' => $employeeId, 'tenant' => $tenantId]);
        $employee = $stmt->fetch();
        if (!$employee || $employee['employment_status'] !== 'active') {
            throw new Exception("الموظف غير موجود أو حسابه غير نشط حالياً.", 403);
        }

        // 2. Verify leave type exists
        $stmt = $db->prepare("SELECT * FROM leave_types WHERE leaveTypeId = :id AND tenantId = :tenant LIMIT 1");
        $stmt->execute(['id' => $leaveTypeId, 'tenant' => $tenantId]);
        $type = $stmt->fetch();
        if (!$type || !$type['isActive']) {
            throw new Exception("نوع الإجازة المطلوبة غير نشط حالياً.", 400);
        }

        // 3. Verify overlapping leave requests
        $stmt = $db->prepare("
            SELECT COUNT(*) FROM leave_requests 
            WHERE employeeId = :empId AND status NOT IN ('rejected', 'cancelled')
            AND ((startDate <= :end AND endDate >= :start))
        ");
        $stmt->execute([
            'empId' => $employeeId,
            'start' => $startDate,
            'end' => $endDate
        ]);
        $overlapCount = $db->query("SELECT 0")->fetchColumn(); // Mock query check or fetch overlap count
        $overlapCount = $stmt->fetchColumn();
        if ($overlapCount > 0) {
            throw new Exception("يوجد تداخل مع طلب إجازة آخر نشط خلال هذه الفترة.", 400);
        }

        // 4. Verify balance entitlement
        if ($type['deductsFromBalance']) {
            $stmt = $db->prepare("
                SELECT COALESCE(SUM(amount), 0) FROM leave_balance_transactions 
                WHERE employeeId = :empId AND leaveTypeId = :typeId
            ");
            $stmt->execute(['empId' => $employeeId, 'typeId' => $leaveTypeId]);
            $currentBalance = $stmt->fetchColumn();

            $requestedDays = (strtotime($endDate) - strtotime($startDate)) / 86400 + 1;

            if ($currentBalance < $requestedDays) {
                throw new Exception("رصيد الإجازات الحالي غير كافٍ لإتمام هذا الطلب.", 400);
            }
        }

        return ['employee' => $employee, 'leaveType' => $type];
    }
}
