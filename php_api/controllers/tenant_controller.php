<?php
/**
 * Tenant Controller - Resolution Engine for Web & Mobile crystal_hr App
 */
class TenantController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function resolveTenant($identifier) {
        try {
            $cleaned = strtolower(trim($identifier));
            $cleaned = str_replace(['https://', 'http://', 'www.'], '', $cleaned);
            
            // Remove domain suffix if passed as full hostname e.g. hadiyah.beattend.com -> hadiyah
            if (strpos($cleaned, '.beattend.com') !== false) {
                $cleaned = explode('.beattend.com', $cleaned)[0];
            }

            $stmt = $this->db->prepare("
                SELECT t.*, s.status AS subscription_status, s.start_date, s.end_date,
                       sp.name_ar AS plan_name, sp.max_admin_users, sp.max_employees, sp.geofencing_enabled, sp.payroll_enabled,
                       c.id AS company_id, c.name_ar AS company_name, c.logo_url
                FROM tenants t
                LEFT JOIN subscriptions s ON t.tenant_id = s.tenant_id AND s.status = 'active'
                LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
                LEFT JOIN companies c ON t.tenant_id = c.tenant_id
                WHERE LOWER(t.company_code) = :ident1 
                   OR LOWER(t.slug) = :ident2 
                   OR LOWER(t.subdomain) = :ident3 
                   OR LOWER(t.tenant_id) = :ident4
                LIMIT 1
            ");
            $stmt->execute([
                'ident1' => $cleaned,
                'ident2' => $cleaned,
                'ident3' => $cleaned,
                'ident4' => $cleaned
            ]);
            $tenant = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$tenant) {
                ApiResponse::error('رمز الشركة أو الدومين غير صحيح وغير مسجل في المنصة', 404);
                return;
            }

            if ($tenant['status'] === 'suspended') {
                ApiResponse::error('حساب هذه الشركة معطل حالياً من قبل إدارة المنصة. يرجى التواصل مع الدعم الفني', 403);
                return;
            }

            $isSubExpired = false;
            if (!empty($tenant['end_date'])) {
                $expiry = strtotime($tenant['end_date']);
                if ($expiry < time()) {
                    $isSubExpired = true;
                }
            }

            ApiResponse::send([
                'tenant_id' => $tenant['tenant_id'],
                'company_id' => (int)($tenant['company_id'] ?? 1),
                'company_code' => strtoupper($tenant['company_code']),
                'company_name' => $tenant['company_name'] ?: 'شركة الحلول المتقدمة',
                'company_logo' => $tenant['logo_url'] ?: 'https://via.placeholder.com/150',
                'subdomain' => $tenant['subdomain'],
                'status' => $tenant['status'],
                'subscription_status' => $isSubExpired ? 'expired' : ($tenant['subscription_status'] ?: 'active'),
                'is_subscription_active' => !$isSubExpired,
                'plan_name' => $tenant['plan_name'] ?: 'الباقة المؤسسية',
                'enabled_features' => [
                    'geofencing' => (bool)($tenant['geofencing_enabled'] ?? true),
                    'payroll' => (bool)($tenant['payroll_enabled'] ?? true),
                    'documents' => true,
                    'reports' => true,
                    'mobile_app' => true
                ],
                'authentication_method' => 'jwt_firebase'
            ], 'تم التعرف على الشركة واسترجاع إعدادات الدخول بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء فحص بيانات المستأجر: ' . $e->getMessage(), 500);
        }
    }
}
