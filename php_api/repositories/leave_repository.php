<?php
/**
 * Leave Repository Class
 */
class LeaveRepository {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    public function getLeaveTypes($tenantId) {
        $stmt = $this->db->prepare("SELECT * FROM leave_types WHERE tenantId = :tenant AND isActive = 1");
        $stmt->execute(['tenant' => $tenantId]);
        return $stmt->fetchAll();
    }

    public function getLeaveBalances($employeeId) {
        $stmt = $this->db->prepare("
            SELECT lt.name as leave_type, lt.code as leave_type_code,
                   COALESCE(lb.opening_balance, 20.00) as opening_balance,
                   COALESCE(lb.accrued_balance, 0.00) as accrued_balance,
                   COALESCE(lb.used_balance, 0.00) as used_balance,
                   COALESCE(lb.pending_reserved_balance, 0.00) as pending_balance,
                   COALESCE(lb.available_balance, 20.00) as remaining_balance,
                   COALESCE(lb.carried_forward_balance, 0.00) as carried_forward_balance
            FROM leave_types lt
            LEFT JOIN leave_balances lb ON lb.leave_type_id = lt.id AND lb.employee_id = :empId
            WHERE lt.isActive = 1
        ");
        $stmt->execute(['empId' => $employeeId]);
        return $stmt->fetchAll();
    }

    public function getBalanceTransactions($employeeId, $leaveTypeId) {
        $stmt = $this->db->prepare("
            SELECT * FROM leave_balance_transactions 
            WHERE employeeId = :empId AND leaveTypeId = :typeId
            ORDER BY createdAt DESC
        ");
        $stmt->execute(['empId' => $employeeId, 'typeId' => $leaveTypeId]);
        return $stmt->fetchAll();
    }

    public function createRequest($data) {
        $stmt = $this->db->prepare("
            INSERT INTO leave_requests (
                requestNumber, tenantId, companyId, employeeId, leaveTypeId, 
                startDate, endDate, requestedDays, workingDays, reason, status
            ) VALUES (
                :reqNum, :tenantId, :companyId, :employeeId, :leaveTypeId, 
                :startDate, :endDate, :requestedDays, :workingDays, :reason, 'pending_manager'
            )
        ");
        $stmt->execute([
            'reqNum' => 'REQ-' . time() . '-' . rand(10, 99),
            'tenantId' => $data['tenantId'],
            'companyId' => $data['companyId'] ?? 1,
            'employeeId' => $data['employeeId'],
            'leaveTypeId' => $data['leaveTypeId'],
            'startDate' => $data['startDate'],
            'endDate' => $data['endDate'],
            'requestedDays' => $data['requestedDays'],
            'workingDays' => $data['workingDays'],
            'reason' => $data['reason'] ?? ''
        ]);
        return $this->db->lastInsertId();
    }

    public function createRequestDays($requestId, $days) {
        $stmt = $this->db->prepare("
            INSERT INTO leave_request_days (requestId, dayDate, dayType, isDeducted)
            VALUES (:requestId, :dayDate, :dayType, :isDeducted)
        ");
        foreach ($days as $day) {
            $stmt->execute([
                'requestId' => $requestId,
                'dayDate' => $day['date'],
                'dayType' => $day['type'] ?? 'working_day',
                'isDeducted' => $day['isDeducted'] ?? true
            ]);
        }
    }

    public function createApprovals($requestId, $workflowSteps) {
        $stmt = $this->db->prepare("
            INSERT INTO leave_approvals (requestId, sequence, approverType, approverId, status)
            VALUES (:requestId, :seq, :type, :approverId, 'pending')
        ");
        // default: direct manager sequence 1, HR sequence 2
        $stmt->execute([
            'requestId' => $requestId,
            'seq' => 1,
            'type' => 'manager',
            'approverId' => 2 // Default direct manager id placeholder
        ]);
        $stmt->execute([
            'requestId' => $requestId,
            'seq' => 2,
            'type' => 'hr',
            'approverId' => 1 // Default HR admin id placeholder
        ]);
    }

    public function getPendingApprovals($approverId, $type = 'manager') {
        $stmt = $this->db->prepare("
            SELECT r.*, e.first_name, e.last_name, t.name as leave_type_name
            FROM leave_requests r
            JOIN employees e ON r.employeeId = e.id
            JOIN leave_types t ON r.leaveTypeId = t.leaveTypeId
            JOIN leave_approvals a ON r.requestId = a.requestId
            WHERE a.approverId = :approverId AND a.approverType = :type AND a.status = 'pending'
        ");
        $stmt->execute(['approverId' => $approverId, 'type' => $type]);
        return $stmt->fetchAll();
    }

    public function updateRequestStatus($requestId, $status) {
        $stmt = $this->db->prepare("UPDATE leave_requests SET status = :status WHERE requestId = :id");
        $stmt->execute(['status' => $status, 'id' => $requestId]);
    }

    public function updateApprovalStep($requestId, $approverId, $status, $comment) {
        $stmt = $this->db->prepare("
            UPDATE leave_approvals 
            SET status = :status, actionTimestamp = NOW(), comment = :comment
            WHERE requestId = :requestId AND approverId = :approverId
        ");
        $stmt->execute([
            'status' => $status,
            'comment' => $comment,
            'requestId' => $requestId,
            'approverId' => $approverId
        ]);
    }

    public function recordTransaction($data) {
        $stmt = $this->db->prepare("
            INSERT INTO leave_balance_transactions (
                employeeId, leaveTypeId, amount, balanceBefore, balanceAfter, sourceType, sourceId, reason
            ) VALUES (
                :employeeId, :leaveTypeId, :amount, :balanceBefore, :balanceAfter, :sourceType, :sourceId, :reason
            )
        ");
        $stmt->execute([
            'employeeId' => $data['employeeId'],
            'leaveTypeId' => $data['leaveTypeId'],
            'amount' => $data['amount'],
            'balanceBefore' => $data['balanceBefore'],
            'balanceAfter' => $data['balanceAfter'],
            'sourceType' => $data['sourceType'],
            'sourceId' => $data['sourceId'] ?? null,
            'reason' => $data['reason'] ?? ''
        ]);
    }
}
