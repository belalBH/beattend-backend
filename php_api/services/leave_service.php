<?php
/**
 * Leave Service Class
 */
require_once __DIR__ . '/../repositories/leave_repository.php';

class LeaveService {
    private $repo;
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->repo = new LeaveRepository($dbConnection);
    }

    private function getOrCreateBalance($employeeId, $leaveTypeId, $tenantId) {
        $stmt = $this->db->prepare("
            SELECT * FROM leave_balances 
            WHERE employee_id = :empId AND leave_type_id = :typeId AND tenant_id = :tenant 
            LIMIT 1
        ");
        $stmt->execute(['empId' => $employeeId, 'typeId' => $leaveTypeId, 'tenant' => $tenantId]);
        $balance = $stmt->fetch();

        if (!$balance) {
            $stmt = $this->db->prepare("
                INSERT INTO leave_balances (
                    tenant_id, company_id, employee_id, leave_type_id, 
                    opening_balance, accrued_balance, carried_forward_balance, 
                    used_balance, pending_reserved_balance, expired_balance, available_balance
                ) VALUES (
                    :tenant, 1, :empId, :typeId,
                    20.00, 0.00, 0.00, 0.00, 0.00, 0.00, 20.00
                )
            ");
            $stmt->execute(['tenant' => $tenantId, 'empId' => $employeeId, 'typeId' => $leaveTypeId]);
            
            $stmt = $this->db->prepare("
                SELECT * FROM leave_balances 
                WHERE employee_id = :empId AND leave_type_id = :typeId AND tenant_id = :tenant 
                LIMIT 1
            ");
            $stmt->execute(['empId' => $employeeId, 'typeId' => $leaveTypeId, 'tenant' => $tenantId]);
            $balance = $stmt->fetch();
        }
        return $balance;
    }

    public function submitRequest($input, $tenantId) {
        $this->db->beginTransaction();
        try {
            $employeeId = $input['employeeId'];
            $leaveTypeId = $input['leaveTypeId'];
            $startDate = $input['startDate'];
            $endDate = $input['endDate'];

            // 1. Calculate requested days
            $start = strtotime($startDate);
            $end = strtotime($endDate);
            $totalDays = round(($end - $start) / 86400) + 1;

            $workingDays = 0;
            $dayDetails = [];

            for ($i = 0; $i < $totalDays; $i++) {
                $currDate = date('Y-m-d', strtotime("+$i day", $start));
                $dayOfWeek = date('N', strtotime($currDate));
                
                $type = 'working_day';
                $isDeducted = true;

                if ($dayOfWeek == 5 || $dayOfWeek == 6) { // Weekend
                    $type = 'weekend';
                    $isDeducted = false;
                } else {
                    $workingDays++;
                }

                $dayDetails[] = [
                    'date' => $currDate,
                    'type' => $type,
                    'isDeducted' => $isDeducted
                ];
            }

            $input['requestedDays'] = $totalDays;
            $input['workingDays'] = $workingDays;
            $input['tenantId'] = $tenantId;

            // 2. Query and reserve leave balance
            $balance = $this->getOrCreateBalance($employeeId, $leaveTypeId, $tenantId);
            
            $newPending = $balance['pending_reserved_balance'] + $workingDays;
            $newAvailable = $balance['opening_balance'] + $balance['accrued_balance'] + $balance['carried_forward_balance'] - $balance['used_balance'] - $newPending - $balance['expired_balance'];

            if ($newAvailable < 0) {
                throw new Exception("رصيد الإجازات المتاح غير كافٍ لإتمام العملية.", 400);
            }

            // Update balance
            $stmt = $this->db->prepare("
                UPDATE leave_balances 
                SET pending_reserved_balance = :pending, available_balance = :available 
                WHERE id = :id
            ");
            $stmt->execute(['pending' => $newPending, 'available' => $newAvailable, 'id' => $balance['id']]);

            // 3. Create request and approval steps
            $requestId = $this->repo->createRequest($input);
            $this->repo->createRequestDays($requestId, $dayDetails);
            $this->repo->createApprovals($requestId, 'manager_then_hr');

            // 4. Create persistent notification for manager only
            $stmt = $this->db->prepare("
                INSERT INTO request_notifications (tenantId, companyId, recipientEmployeeId, requestId, eventType, title, message, status)
                VALUES (:tenant, 1, 2, :reqId, 'leave.manager_approval_required', 'طلب إجازة جديد معلق', 'قام موظف بتقديم طلب إجازة جديد بانتظار موافقتك.', 'unread')
            ");
            $stmt->execute(['tenant' => $tenantId, 'reqId' => $requestId]);

            $this->db->commit();
            return $requestId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function processManagerAction($requestId, $approverId, $decision, $comment) {
        $this->db->beginTransaction();
        try {
            $status = ($decision === 'approve') ? 'approved' : 'rejected';
            $this->repo->updateApprovalStep($requestId, $approverId, $status, $comment);

            // Fetch request info
            $stmt = $this->db->prepare("SELECT * FROM leave_requests WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $requestId]);
            $req = $stmt->fetch();

            if ($decision === 'approve') {
                // Forward to HR
                $this->repo->updateRequestStatus($requestId, 'pending_hr');

                // Notification for HR
                $stmt = $this->db->prepare("
                    INSERT INTO request_notifications (tenantId, companyId, recipientEmployeeId, requestId, eventType, title, message, status)
                    VALUES (:tenant, 1, 1, :reqId, 'leave.hr_approval_required', 'طلب إجازة بانتظار اعتماد الموارد البشرية', 'وافق المدير المباشر على طلب الإجازة وتم إرساله إليك للاعتماد.', 'unread')
                ");
                $stmt->execute(['tenant' => $req['tenantId'], 'reqId' => $requestId]);
            } else {
                $this->repo->updateRequestStatus($requestId, 'rejected');

                // Release reservation
                $balance = $this->getOrCreateBalance($req['employeeId'], $req['leaveTypeId'], $req['tenantId']);
                $newPending = max(0, $balance['pending_reserved_balance'] - $req['workingDays']);
                $newAvailable = $balance['opening_balance'] + $balance['accrued_balance'] + $balance['carried_forward_balance'] - $balance['used_balance'] - $newPending - $balance['expired_balance'];

                $stmt = $this->db->prepare("
                    UPDATE leave_balances 
                    SET pending_reserved_balance = :pending, available_balance = :available 
                    WHERE id = :id
                ");
                $stmt->execute(['pending' => $newPending, 'available' => $newAvailable, 'id' => $balance['id']]);

                // Notification for Employee
                $stmt = $this->db->prepare("
                    INSERT INTO request_notifications (tenantId, companyId, recipientEmployeeId, requestId, eventType, title, message, status)
                    VALUES (:tenant, 1, :empId, :reqId, 'leave.manager_rejected', 'تم رفض طلب الإجازة', :comment, 'unread')
                ");
                $stmt->execute([
                    'tenant' => $req['tenantId'],
                    'empId' => $req['employeeId'],
                    'reqId' => $requestId,
                    'comment' => 'تم رفض طلبك بواسطة المدير المباشر: ' . $comment
                ]);
            }
            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function processHrAction($requestId, $approverId, $decision, $comment) {
        $this->db->beginTransaction();
        try {
            $status = ($decision === 'approve') ? 'approved' : 'rejected';
            $this->repo->updateApprovalStep($requestId, $approverId, $status, $comment);

            // Fetch request info
            $stmt = $this->db->prepare("SELECT * FROM leave_requests WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $requestId]);
            $req = $stmt->fetch();

            $balance = $this->getOrCreateBalance($req['employeeId'], $req['leaveTypeId'], $req['tenantId']);

            if ($decision === 'approve') {
                $this->repo->updateRequestStatus($requestId, 'approved');

                // 1. Release reservation and deduct balance
                $newPending = max(0, $balance['pending_reserved_balance'] - $req['workingDays']);
                $newUsed = $balance['used_balance'] + $req['workingDays'];
                $newAvailable = $balance['opening_balance'] + $balance['accrued_balance'] + $balance['carried_forward_balance'] - $newUsed - $newPending - $balance['expired_balance'];

                $stmt = $this->db->prepare("
                    UPDATE leave_balances 
                    SET pending_reserved_balance = :pending, used_balance = :used, available_balance = :available 
                    WHERE id = :id
                ");
                $stmt->execute(['pending' => $newPending, 'used' => $newUsed, 'available' => $newAvailable, 'id' => $balance['id']]);

                // 2. Insert negative ledger entry
                $stmt = $this->db->prepare("
                    INSERT INTO leave_balance_transactions (
                        tenant_id, company_id, employee_id, leave_balance_id, 
                        source_type, source_id, transaction_type, amount, balance_before, balance_after, reason
                    ) VALUES (
                        :tenant, 1, :empId, :balanceId,
                        'leave_request', :reqId, 'deduction', :amount, :before, :after, 'خصم رصيد الإجازة المعتمدة'
                    )
                ");
                $stmt->execute([
                    'tenant' => $req['tenantId'],
                    'empId' => $req['employeeId'],
                    'balanceId' => $balance['id'],
                    'reqId' => $requestId,
                    'amount' => -$req['workingDays'],
                    'before' => $balance['available_balance'],
                    'after' => $newAvailable
                ]);

                // Notification for Employee
                $stmt = $this->db->prepare("
                    INSERT INTO request_notifications (tenantId, companyId, recipientEmployeeId, requestId, eventType, title, message, status)
                    VALUES (:tenant, 1, :empId, :reqId, 'leave.hr_approved', 'تم اعتماد الإجازة نهائياً', 'تمت الموافقة النهائية على طلب إجازتك من قبل الموارد البشرية.', 'unread')
                ");
                $stmt->execute(['tenant' => $req['tenantId'], 'empId' => $req['employeeId'], 'reqId' => $requestId]);
            } else {
                $this->repo->updateRequestStatus($requestId, 'rejected');

                // Release reservation
                $newPending = max(0, $balance['pending_reserved_balance'] - $req['workingDays']);
                $newAvailable = $balance['opening_balance'] + $balance['accrued_balance'] + $balance['carried_forward_balance'] - $balance['used_balance'] - $newPending - $balance['expired_balance'];

                $stmt = $this->db->prepare("
                    UPDATE leave_balances 
                    SET pending_reserved_balance = :pending, available_balance = :available 
                    WHERE id = :id
                ");
                $stmt->execute(['pending' => $newPending, 'available' => $newAvailable, 'id' => $balance['id']]);

                // Notification for Employee
                $stmt = $this->db->prepare("
                    INSERT INTO request_notifications (tenantId, companyId, recipientEmployeeId, requestId, eventType, title, message, status)
                    VALUES (:tenant, 1, :empId, :reqId, 'leave.hr_rejected', 'تم رفض طلب الإجازة من الموارد البشرية', :comment, 'unread')
                ");
                $stmt->execute([
                    'tenant' => $req['tenantId'],
                    'empId' => $req['employeeId'],
                    'reqId' => $requestId,
                    'comment' => 'تم رفض طلب إجازتك من قبل الموارد البشرية: ' . $comment
                ]);
            }
            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
