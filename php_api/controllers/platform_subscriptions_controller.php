<?php
/**
 * PlatformSubscriptionsController - Manage SaaS Subscriptions Lifecycle
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class PlatformSubscriptionsController {

    private function verifyPlatformSuperAdmin() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $platformToken = $headers['X-Platform-Token'] ?? $headers['x-platform-token'] ?? '';

        if ($platformToken === 'PlatformSuperAdminSecret2026!' || strpos($authHeader, 'PlatformAdminToken') !== false) {
            return true;
        }

        http_response_code(401);
        echo json_encode([
            'success' => false,
            'code' => 401,
            'message' => '⚠️ 401 Unauthorized: تطلب هذا الإجراء صلاحيات Platform Super Admin',
            'errors' => ['SUPERADMIN_AUTH_REQUIRED'],
            'timestamp' => date('c')
        ]);
        exit;
    }

    public function getSubscriptions() {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->query("
            SELECT s.id, s.tenant_id, s.plan_id, s.start_date, s.end_date, s.status,
                   c.name_ar AS company_name, t.company_code, sp.name_ar AS plan_name, sp.price_monthly
            FROM subscriptions s
            JOIN tenants t ON t.tenant_id = s.tenant_id
            LEFT JOIN companies c ON c.tenant_id = s.tenant_id
            LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
            ORDER BY s.id DESC
        ");

        ApiResponse::success($stmt->fetchAll(PDO::FETCH_ASSOC), 'تم استرجاع قائمة الاشتراكات بنجاح');
    }

    public function renewSubscription($input) {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $subId = (int)($input['subscription_id'] ?? 0);
        $months = (int)($input['months'] ?? 12);

        if (!$subId) {
            ApiResponse::error('معرف الاشتراك مطلوب', 400);
            return;
        }

        $stmt = $pdo->prepare("
            UPDATE subscriptions
            SET end_date = DATE_ADD(GREATEST(end_date, NOW()), INTERVAL :months MONTH),
                status = 'active'
            WHERE id = :id
        ");
        $stmt->execute([':months' => $months, ':id' => $subId]);

        ApiResponse::success(null, "تم تجديد الاشتراك بنجاح لمدّة ({$months}) شهر إضافية");
    }
}
