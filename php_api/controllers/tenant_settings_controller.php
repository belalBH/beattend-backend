<?php
/**
 * TenantSettingsController - Dynamic Tenant Policies & Leave Types Integration for Web & Mobile Apps
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class TenantSettingsController {

    public function getLeaveTypes($tenantId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT id, name_ar, name_en, days_credit, is_paid, requires_attachment,
                   min_days, max_days, approval_flow, is_active
            FROM leave_types
            WHERE tenant_id = :t_id OR tenant_id IS NULL
            ORDER BY is_active DESC, id ASC
        ");
        $stmt->execute([':t_id' => $tenantId]);
        $leaveTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format for mobile app crystal_hr compatibility
        foreach ($leaveTypes as &$lt) {
            $lt['days_credit'] = (int)$lt['days_credit'];
            $lt['is_paid'] = (bool)$lt['is_paid'];
            $lt['requires_attachment'] = (bool)$lt['requires_attachment'];
            $lt['min_days'] = (int)($lt['min_days'] ?? 1);
            $lt['max_days'] = (int)($lt['max_days'] ?? 30);
        }

        ApiResponse::success($leaveTypes, 'تم استرجاع أنواع وسياسات الإجازات بنجاح');
    }

    public function createLeaveType($tenantId, $input) {
        $nameAr = trim($input['name_ar'] ?? '');
        $daysCredit = (int)($input['days_credit'] ?? 21);

        if (empty($nameAr)) {
            ApiResponse::error('اسم نوع الإجازة بالعربية مطلوب', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            INSERT INTO leave_types (tenant_id, name_ar, name_en, days_credit, is_paid, requires_attachment, min_days, max_days, approval_flow, is_active)
            VALUES (:t, :nar, :nen, :days, :paid, :att, :min, :max, :flow, 1)
        ");
        $stmt->execute([
            ':t' => $tenantId,
            ':nar' => $nameAr,
            ':nen' => $input['name_en'] ?? $nameAr,
            ':days' => $daysCredit,
            ':paid' => isset($input['is_paid']) ? ((bool)$input['is_paid'] ? 1 : 0) : 1,
            ':att' => isset($input['requires_attachment']) ? ((bool)$input['requires_attachment'] ? 1 : 0) : 0,
            ':min' => (int)($input['min_days'] ?? 1),
            ':max' => (int)($input['max_days'] ?? 30),
            ':flow' => $input['approval_flow'] ?? 'standard'
        ]);

        $leaveTypeId = $pdo->lastInsertId();
        ApiResponse::success(['leave_type_id' => $leaveTypeId], 'تم إضافة نوع الإجازة الجديد بنجاح وتوفيره لتطبيق الهاتف والواجهة', 201);
    }

    public function updateLeaveType($leaveTypeId, $input) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            UPDATE leave_types
            SET name_ar = :nar, name_en = :nen, days_credit = :days, is_paid = :paid,
                requires_attachment = :att, min_days = :min, max_days = :max, is_active = :act
            WHERE id = :id
        ");
        $stmt->execute([
            ':nar' => trim($input['name_ar'] ?? ''),
            ':nen' => trim($input['name_en'] ?? ''),
            ':days' => (int)($input['days_credit'] ?? 21),
            ':paid' => ((bool)($input['is_paid'] ?? true)) ? 1 : 0,
            ':att' => ((bool)($input['requires_attachment'] ?? false)) ? 1 : 0,
            ':min' => (int)($input['min_days'] ?? 1),
            ':max' => (int)($input['max_days'] ?? 30),
            ':act' => ((bool)($input['is_active'] ?? true)) ? 1 : 0,
            ':id' => $leaveTypeId
        ]);

        ApiResponse::success(null, 'تم تحديث سياسة ونوع الإجازة بنجاح');
    }
}
