<?php
/**
 * Dynamic Request Service Class
 */
require_once __DIR__ . '/../repositories/dynamic_request_repository.php';

class DynamicRequestService {
    private $repo;
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->repo = new DynamicRequestRepository($dbConnection);
    }

    public function createDraft($input, $tenantId) {
        $this->db->beginTransaction();
        try {
            $input['tenantId'] = $tenantId;
            $input['companyId'] = $input['companyId'] ?? 1;

            // Save parent requests row
            $requestId = $this->repo->createRequestInstance($input);

            // Fetch field templates configuration
            $fields = $this->repo->getFieldsForType($input['requestTypeId']);
            $this->repo->saveFieldValues($requestId, $input['fieldValues'] ?? [], $fields);

            // Audit draft status history
            $stmt = $this->db->prepare("
                INSERT INTO request_status_history (requestId, tenantId, companyId, statusFrom, statusTo, actorId, comment)
                VALUES (:requestId, :tenantId, :companyId, 'none', 'draft', :actorId, 'حفظ مسودة الطلب محلياً')
            ");
            $stmt->execute([
                'requestId' => $requestId,
                'tenantId' => $tenantId,
                'companyId' => $input['companyId'],
                'actorId' => $input['employeeId']
            ]);

            $this->db->commit();
            return $requestId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function submit($requestId) {
        $this->db->beginTransaction();
        try {
            $this->repo->submitRequestToWorkflow($requestId);

            // Get request info
            $stmt = $this->db->prepare("SELECT * FROM requests WHERE requestId = :id LIMIT 1");
            $stmt->execute(['id' => $requestId]);
            $req = $stmt->fetch();

            // Insert initial workflow approvals step (Manager)
            $stmt = $this->db->prepare("
                INSERT INTO request_approvals (requestId, stepId, approverId, approverRole, status, idempotencyUuid)
                VALUES (:requestId, 1, 2, 'manager', 'pending', :idempotency)
            ");
            $stmt->execute([
                'requestId' => $requestId,
                'idempotency' => 'app-' . time() . '-' . rand(100, 999)
            ]);

            // Audit submission status history
            $stmt = $this->db->prepare("
                INSERT INTO request_status_history (requestId, tenantId, companyId, statusFrom, statusTo, actorId, comment)
                VALUES (:requestId, :tenantId, :companyId, 'draft', 'submitted', :actorId, 'تقديم الطلب وبدء مسار الموافقات')
            ");
            $stmt->execute([
                'requestId' => $requestId,
                'tenantId' => $req['tenantId'],
                'companyId' => $req['companyId'],
                'actorId' => $req['employeeId']
            ]);

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function processApproval($approvalId, $status, $comment) {
        $this->db->beginTransaction();
        try {
            $this->repo->recordApprovalAction($approvalId, $status, $comment);

            // Fetch approval details
            $stmt = $this->db->prepare("SELECT * FROM request_approvals WHERE approvalId = :id LIMIT 1");
            $stmt->execute(['id' => $approvalId]);
            $app = $stmt->fetch();

            // Update parent requests status
            $newStatus = ($status === 'approved') ? 'in_review' : 'rejected';
            $stmt = $this->db->prepare("UPDATE requests SET status = :status WHERE requestId = :id");
            $stmt->execute(['status' => $newStatus, 'id' => $app['requestId']]);

            // If rejected, audit final rejection
            if ($status === 'rejected') {
                $stmt = $this->db->prepare("UPDATE requests SET status = 'rejected', completedAt = NOW() WHERE requestId = :id");
                $stmt->execute(['id' => $app['requestId']]);
            }

            $this->db->commit();
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
