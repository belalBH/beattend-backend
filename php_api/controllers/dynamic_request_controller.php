<?php
/**
 * Dynamic Request Controller
 */
require_once __DIR__ . '/../validators/dynamic_request_validator.php';
require_once __DIR__ . '/../services/dynamic_request_service.php';
require_once __DIR__ . '/../repositories/dynamic_request_repository.php';

class DynamicRequestController {
    private $db;
    private $service;
    private $repo;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->service = new DynamicRequestService($dbConnection);
        $this->repo = new DynamicRequestRepository($dbConnection);
    }

    public function getRequestTypes($tenantId) {
        $types = $this->repo->getRequestTypes($tenantId);
        ApiResponse::success($types, 'أنواع الطلبات الفعالة');
    }

    public function getFields($typeId) {
        $fields = $this->repo->getFieldsForType($typeId);
        ApiResponse::success($fields, 'حقول نموذج الطلب');
    }

    public function createDraft($input, $tenantId) {
        try {
            $validation = DynamicRequestValidator::validateSubmission($this->db, $input, $tenantId);
            $id = $this->service->createDraft($input, $tenantId);
            ApiResponse::success(['requestId' => $id], 'تم حفظ مسودة الطلب بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function submitRequest($requestId) {
        try {
            $this->service->submit($requestId);
            ApiResponse::success(null, 'تم تقديم الطلب ودخول مسار الموافقات بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getPendingApprovals($approverId, $role) {
        $list = $this->repo->getPendingApprovals($approverId, $role);
        ApiResponse::success($list, 'الطلبات بانتظار موافقتك');
    }

    public function approveAction($approvalId, $input) {
        try {
            $comment = $input['comment'] ?? '';
            $this->service->processApproval($approvalId, 'approved', $comment);
            ApiResponse::success(null, 'تمت الموافقة على الطلب بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function rejectAction($approvalId, $input) {
        try {
            $comment = $input['comment'] ?? '';
            $this->service->processApproval($approvalId, 'rejected', $comment);
            ApiResponse::success(null, 'تم رفض الطلب');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getTimeline($requestId) {
        $timeline = $this->repo->getTimeline($requestId);
        ApiResponse::success($timeline, 'خط سير الطلب والموافقات');
    }

    public function getComments($requestId) {
        $comments = $this->repo->getComments($requestId);
        ApiResponse::success($comments, 'ملاحظات الطلب');
    }

    public function addComment($requestId, $input, $tenantId) {
        try {
            $actorId = $input['actorId'] ?? 1;
            $companyId = $input['companyId'] ?? 1;
            $text = $input['commentText'] ?? '';
            $this->repo->addComment($requestId, $tenantId, $companyId, $actorId, $text);
            ApiResponse::success(null, 'تم إضافة التعليق بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function getApprovalDetails($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM request_approvals WHERE approvalId = :id LIMIT 1");
            $stmt->execute(['id' => $id]);
            ApiResponse::success($stmt->fetch(), 'تفاصيل خطوة الاعتماد');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function returnAction($approvalId, $input) {
        try {
            $comment = $input['comment'] ?? '';
            $this->service->processApproval($approvalId, 'returned', $comment);
            ApiResponse::success(null, 'تم إرجاع الطلب للموظف لتعديل البيانات');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function delegateAction($approvalId, $input) {
        try {
            $delegateTo = $input['delegateToEmployeeId'];
            $stmt = $this->db->prepare("UPDATE request_approvals SET approverId = :delegate WHERE approvalId = :id");
            $stmt->execute(['delegate' => $delegateTo, 'id' => $approvalId]);
            ApiResponse::success(null, 'تم تفويض خطوة الاعتماد بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function cancelRequest($requestId, $input) {
        try {
            $stmt = $this->db->prepare("UPDATE requests SET status = 'cancelled', cancelledAt = NOW() WHERE requestId = :id");
            $stmt->execute(['id' => $requestId]);
            ApiResponse::success(null, 'تم إلغاء الطلب بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }

    public function resubmitRequest($requestId, $input) {
        try {
            $stmt = $this->db->prepare("UPDATE requests SET status = 'submitted', submittedAt = NOW() WHERE requestId = :id");
            $stmt->execute(['id' => $requestId]);
            ApiResponse::success(null, 'تم إعادة تقديم الطلب بنجاح');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }
}
