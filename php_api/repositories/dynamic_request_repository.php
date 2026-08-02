<?php
/**
 * Dynamic Request Repository Class
 */
class DynamicRequestRepository {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    public function getRequestTypes($tenantId) {
        $stmt = $this->db->prepare("SELECT * FROM request_types WHERE tenantId = :tenant AND isActive = 1 AND deletedAt IS NULL");
        $stmt->execute(['tenant' => $tenantId]);
        return $stmt->fetchAll();
    }

    public function getFieldsForType($typeId) {
        $stmt = $this->db->prepare("SELECT * FROM request_fields WHERE requestTypeId = :typeId AND deletedAt IS NULL ORDER BY displayOrder ASC");
        $stmt->execute(['typeId' => $typeId]);
        return $stmt->fetchAll();
    }

    public function createRequestInstance($data) {
        $stmt = $this->db->prepare("
            INSERT INTO requests (
                requestNumber, tenantId, companyId, employeeId, requestTypeId, 
                requestTypeVersion, workflowId, workflowVersion, status, idempotencyUuid, createdBy
            ) VALUES (
                :reqNum, :tenantId, :companyId, :employeeId, :requestTypeId,
                :typeVer, :workflowId, :workflowVer, 'draft', :idempotency, :createdBy
            )
        ");
        $stmt->execute([
            'reqNum' => 'REQ-' . time() . '-' . rand(100, 999),
            'tenantId' => $data['tenantId'],
            'companyId' => $data['companyId'] ?? 1,
            'employeeId' => $data['employeeId'],
            'requestTypeId' => $data['requestTypeId'],
            'typeVer' => $data['version'] ?? 1,
            'workflowId' => $data['workflowId'] ?? 1,
            'workflowVer' => 1,
            'idempotency' => $data['idempotencyUuid'],
            'createdBy' => $data['employeeId']
        ]);
        return $this->db->lastInsertId();
    }

    public function saveFieldValues($requestId, $fieldValues, $fields) {
        $stmt = $this->db->prepare("
            INSERT INTO request_field_values (requestId, fieldId, fieldValue)
            VALUES (:requestId, :fieldId, :fieldValue)
        ");
        foreach ($fields as $field) {
            $key = $field['fieldKey'];
            if (isset($fieldValues[$key])) {
                $stmt->execute([
                    'requestId' => $requestId,
                    'fieldId' => $field['fieldId'],
                    'fieldValue' => $fieldValues[$key]
                ]);
            }
        }
    }

    public function submitRequestToWorkflow($requestId) {
        $stmt = $this->db->prepare("
            UPDATE requests 
            SET status = 'submitted', submittedAt = NOW() 
            WHERE requestId = :id
        ");
        $stmt->execute(['id' => $requestId]);
    }

    public function getPendingApprovals($approverId, $role) {
        $stmt = $this->db->prepare("
            SELECT r.*, rt.nameAr as request_type_name
            FROM requests r
            JOIN request_types rt ON r.requestTypeId = rt.requestTypeId
            JOIN request_approvals ra ON r.requestId = ra.requestId
            WHERE ra.approverId = :approverId AND ra.approverRole = :role AND ra.status = 'pending'
        ");
        $stmt->execute(['approverId' => $approverId, 'role' => $role]);
        return $stmt->fetchAll();
    }

    public function recordApprovalAction($approvalId, $status, $comment) {
        $stmt = $this->db->prepare("
            UPDATE request_approvals 
            SET status = :status, comment = :comment, actionTimestamp = NOW() 
            WHERE approvalId = :id
        ");
        $stmt->execute([
            'status' => $status,
            'comment' => $comment,
            'id' => $approvalId
        ]);
    }

    public function getTimeline($requestId) {
        $stmt = $this->db->prepare("
            SELECT * FROM request_status_history 
            WHERE requestId = :requestId 
            ORDER BY createdAt ASC
        ");
        $stmt->execute(['requestId' => $requestId]);
        return $stmt->fetchAll();
    }

    public function getComments($requestId) {
        $stmt = $this->db->prepare("SELECT * FROM request_comments WHERE requestId = :requestId ORDER BY createdAt DESC");
        $stmt->execute(['requestId' => $requestId]);
        return $stmt->fetchAll();
    }

    public function addComment($requestId, $tenantId, $companyId, $actorId, $text) {
        $stmt = $this->db->prepare("
            INSERT INTO request_comments (requestId, tenantId, companyId, actorId, commentText)
            VALUES (:requestId, :tenantId, :companyId, :actorId, :commentText)
        ");
        $stmt->execute([
            'requestId' => $requestId,
            'tenantId' => $tenantId,
            'companyId' => $companyId,
            'actorId' => $actorId,
            'commentText' => $text
        ]);
    }
}
