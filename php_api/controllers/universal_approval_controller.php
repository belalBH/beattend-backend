<?php
/**
 * UniversalApprovalController - Generic Multi-Step Approval Workflow Engine
 * Governs Leaves, Attendance Corrections, Overtime, Advances & Payroll
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class UniversalApprovalController {

    public function getWorkflows($tenantId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT aw.*,
                   (SELECT COUNT(*) FROM approval_workflow_steps aws WHERE aws.workflow_id = aw.id) AS steps_count
            FROM approval_workflows aw
            WHERE aw.tenant_id = :t_id
            ORDER BY aw.id DESC
        ");
        $stmt->execute([':t_id' => $tenantId]);
        $workflows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($workflows as &$wf) {
            $sStmt = $pdo->prepare("
                SELECT aws.*, r.name_ar AS approver_role_name, pu.full_name AS approver_user_name
                FROM approval_workflow_steps aws
                LEFT JOIN roles r ON r.id = aws.approver_role_id
                LEFT JOIN users pu ON pu.id = aws.approver_user_id
                WHERE aws.workflow_id = :wf_id
                ORDER BY aws.step_order ASC
            ");
            $sStmt->execute([':wf_id' => $wf['id']]);
            $wf['steps'] = $sStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        ApiResponse::success($workflows, 'تم استرجاع مسارات الموافقات الموحدة بنجاح');
    }

    public function createWorkflow($tenantId, $input) {
        $entityType = $input['entity_type'] ?? 'leaves';
        $nameAr = trim($input['name_ar'] ?? '');
        $steps = $input['steps'] ?? [];

        if (empty($nameAr) || empty($steps)) {
            ApiResponse::error('اسم المسار ومراحل الموافقة حقول إجبارية', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        try {
            $pdo->beginTransaction();

            $wStmt = $pdo->prepare("INSERT INTO approval_workflows (tenant_id, entity_type, name_ar, description, is_active) VALUES (:t, :e, :n, :d, 1)");
            $wStmt->execute([
                ':t' => $tenantId,
                ':e' => $entityType,
                ':n' => $nameAr,
                ':d' => $input['description'] ?? null
            ]);
            $workflowId = $pdo->lastInsertId();

            $sStmt = $pdo->prepare("
                INSERT INTO approval_workflow_steps (workflow_id, step_order, step_name_ar, approver_type, approver_role_id, approver_user_id)
                VALUES (:wf, :ord, :sname, :atype, :arid, :auid)
            ");

            foreach ($steps as $idx => $step) {
                $sStmt->execute([
                    ':wf' => $workflowId,
                    ':ord' => $idx + 1,
                    ':sname' => $step['step_name_ar'] ?? "مرحلة " . ($idx + 1),
                    ':atype' => $step['approver_type'] ?? 'role_based',
                    ':arid' => $step['approver_role_id'] ?? null,
                    ':auid' => $step['approver_user_id'] ?? null
                ]);
            }

            $pdo->commit();
            ApiResponse::success(['workflow_id' => $workflowId], 'تم إنشاء مسار الموافقة الديناميكي بنجاح', 201);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            ApiResponse::error('فشل إنشاء مسار الموافقة: ' . $e->getMessage(), 500);
        }
    }

    public function submitRequest($tenantId, $requesterMembershipId, $input) {
        $entityType = $input['entity_type'] ?? 'leaves';
        $entityId = (int)($input['entity_id'] ?? 0);

        if ($entityId <= 0) {
            ApiResponse::error('معرف الطلب المرتبط مطلوب', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // 1. Fetch Active Workflow for Entity Type
        $wfStmt = $pdo->prepare("SELECT id FROM approval_workflows WHERE tenant_id = :t AND entity_type = :e AND is_active = 1 LIMIT 1");
        $wfStmt->execute([':t' => $tenantId, ':e' => $entityType]);
        $workflowId = $wfStmt->fetchColumn();

        if (!$workflowId) {
            // Auto approve if no workflow configured
            ApiResponse::success(['status' => 'approved', 'auto_approved' => true], 'تمت الموافقة المباشرة (لا يوجد مسار معقد معين)');
            return;
        }

        $rStmt = $pdo->prepare("
            INSERT INTO approval_requests (tenant_id, entity_type, entity_id, requester_membership_id, workflow_id, current_step_order, status)
            VALUES (:t, :e, :eid, :req, :wf, 1, 'pending')
        ");
        $rStmt->execute([
            ':t' => $tenantId,
            ':e' => $entityType,
            ':eid' => $entityId,
            ':req' => $requesterMembershipId,
            ':wf' => $workflowId
        ]);
        $requestId = $pdo->lastInsertId();

        ApiResponse::success(['request_id' => $requestId, 'status' => 'pending'], 'تم إرسال الطلب لمحرك الموافقات الموحد بنجاح');
    }

    public function processAction($actionByMembershipId, $input) {
        $requestId = (int)($input['request_id'] ?? 0);
        $action = $input['action'] ?? 'approved'; // approved or rejected
        $comments = trim($input['comments'] ?? '');

        if ($requestId <= 0) {
            ApiResponse::error('معرف طلب الموافقة مطلوب', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // Fetch Request & Current Step Details
        $reqStmt = $pdo->prepare("
            SELECT ar.*, aws.id AS step_id, aws.approver_type, aws.approver_role_id,
                   (SELECT COUNT(*) FROM approval_workflow_steps s WHERE s.workflow_id = ar.workflow_id) AS total_steps
            FROM approval_requests ar
            JOIN approval_workflow_steps aws ON aws.workflow_id = ar.workflow_id AND aws.step_order = ar.current_step_order
            WHERE ar.id = :req_id AND ar.status = 'pending'
            LIMIT 1
        ");
        $reqStmt->execute([':req_id' => $requestId]);
        $request = $reqStmt->fetch(PDO::FETCH_ASSOC);

        if (!$request) {
            ApiResponse::error('طلب الموافقة غير موجود أو تم البت فيه سابقاً', 404);
            return;
        }

        try {
            $pdo->beginTransaction();

            // 1. Log Action in History
            $logStmt = $pdo->prepare("
                INSERT INTO approval_request_actions (request_id, step_id, action_by_membership_id, action, comments)
                VALUES (:rid, :sid, :mem, :act, :com)
            ");
            $logStmt->execute([
                ':rid' => $requestId,
                ':sid' => $request['step_id'],
                ':mem' => $actionByMembershipId,
                ':act' => $action,
                ':com' => $comments
            ]);

            // 2. Decision Logic
            if ($action === 'rejected') {
                $updStmt = $pdo->prepare("UPDATE approval_requests SET status = 'rejected' WHERE id = :rid");
                $updStmt->execute([':rid' => $requestId]);
                $finalStatus = 'rejected';
            } else {
                if ((int)$request['current_step_order'] >= (int)$request['total_steps']) {
                    $updStmt = $pdo->prepare("UPDATE approval_requests SET status = 'approved' WHERE id = :rid");
                    $updStmt->execute([':rid' => $requestId]);
                    $finalStatus = 'approved';
                } else {
                    $nextStep = (int)$request['current_step_order'] + 1;
                    $updStmt = $pdo->prepare("UPDATE approval_requests SET current_step_order = :ns WHERE id = :rid");
                    $updStmt->execute([':ns' => $nextStep, ':rid' => $requestId]);
                    $finalStatus = 'pending';
                }
            }

            $pdo->commit();
            ApiResponse::success(['request_id' => $requestId, 'status' => $finalStatus], "تم تسجيل إجراء ({$action}) بنجاح");

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            ApiResponse::error('فشل معالجة طلب الموافقة: ' . $e->getMessage(), 500);
        }
    }
}
