<?php
/**
 * Attendance Validator Class
 */
class AttendanceValidator {
    public static function validatePunch($db, $input, $tenantId) {
        $employeeId = $input['employeeId'] ?? null;
        $eventType = $input['eventType'] ?? null;
        $idempotencyKey = $input['idempotencyKey'] ?? null;

        if (!$employeeId || !$eventType || !$idempotencyKey) {
            throw new Exception("البيانات المطلوبة للتبصيم ناقصة.", 400);
        }

        // 1. Verify idempotency duplicate key
        $stmt = $db->prepare("SELECT * FROM attendance_events WHERE idempotencyKey = :key LIMIT 1");
        $stmt->execute(['key' => $idempotencyKey]);
        $existingEvent = $stmt->fetch();
        if ($existingEvent) {
            // Return existing event directly (handled at controller level)
            return ['duplicate' => true, 'event' => $existingEvent];
        }

        // 2. Verify active employee status
        $stmt = $db->prepare("SELECT * FROM employees WHERE id = :id AND tenant_id = :tenant LIMIT 1");
        $stmt->execute(['id' => $employeeId, 'tenant' => $tenantId]);
        $employee = $stmt->fetch();
        if (!$employee || $employee['employment_status'] !== 'active') {
            throw new Exception("الموظف غير موجود أو حسابه غير نشط حالياً.", 403);
        }

        // 3. Verify company is active
        $stmt = $db->prepare("SELECT * FROM companies WHERE tenant_id = :tenant LIMIT 1");
        $stmt->execute(['tenant' => $tenantId]);
        $company = $stmt->fetch();
        if (!$company || $company['status'] !== 'active') {
            throw new Exception("الشركة غير نشطة أو موقفة مؤقتاً.", 403);
        }

        // 4. Verify event sequence transition
        self::validateEventSequence($db, $employeeId, $eventType);

        return ['duplicate' => false, 'employee' => $employee, 'company' => $company];
    }

    private static function validateEventSequence($db, $employeeId, $eventType) {
        // Fetch last active event for today
        $stmt = $db->prepare("
            SELECT * FROM attendance_events 
            WHERE employeeId = :empId AND DATE(eventTimestamp) = CURRENT_DATE()
            ORDER BY eventTimestamp DESC LIMIT 1
        ");
        $stmt->execute(['empId' => $employeeId]);
        $lastEvent = $stmt->fetch();

        $lastType = $lastEvent ? $lastEvent['eventType'] : null;

        if ($eventType === 'check_in') {
            if ($lastType && $lastType !== 'check_out') {
                throw new Exception("الموظف مسجل حضور بالفعل اليوم.", 400);
            }
        } else {
            if (!$lastType) {
                throw new Exception("لا يمكن تسجيل العمليات دون وجود تسجيل حضور نشط.", 400);
            }

            if ($eventType === 'check_out') {
                if ($lastType === 'break_start') {
                    throw new Exception("يجب إنهاء الاستراحة أولاً قبل تسجيل الانصراف.", 400);
                }
                if ($lastType === 'check_out') {
                    throw new Exception("تم تسجيل الانصراف بالفعل اليوم.", 400);
                }
            }

            if ($eventType === 'break_start') {
                if ($lastType !== 'check_in' && $lastType !== 'break_end') {
                    throw new Exception("يجب أن يكون الموظف حاضراً لبدء الاستراحة.", 400);
                }
            }

            if ($eventType === 'break_end') {
                if ($lastType !== 'break_start') {
                    throw new Exception("لم يتم بدء أي استراحة لإنهائها.", 400);
                }
            }
        }
    }
}
