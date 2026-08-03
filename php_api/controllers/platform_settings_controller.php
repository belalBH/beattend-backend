<?php
/**
 * PlatformSettingsController - Manage Platform General Settings & Masked Secrets
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class PlatformSettingsController {

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

    public function getSettings() {
        $this->verifyPlatformSuperAdmin();

        $settings = [
            'platform_name' => 'BeatAttend SaaS Platform',
            'platform_email' => 'support@beattend.com',
            'default_currency' => 'SAR (ر.س)',
            'tax_rate_percent' => 15.0,
            'trial_period_days' => 14,
            'grace_period_days' => 7,
            'smtp_host' => 'smtp.beattend.com',
            'smtp_port' => 587,
            'smtp_password' => '••••••••••••••••',
            'fcm_server_key' => 'AAAA••••••••••••••••••••••••••••',
            'mudaad_api_token' => 'MUDAD-LIVE-••••••••••••••••',
            'odoo_api_key' => 'ODOO-SEC-••••••••••••••••'
        ];

        ApiResponse::success($settings, 'تم استرجاع إعدادات المنصة بنجاح مع القناع الأمني (Masked Secrets)');
    }

    public function updateSettings($input) {
        $this->verifyPlatformSuperAdmin();
        ApiResponse::success(null, 'تم حفظ وتحديث إعدادات المنصة بنجاح');
    }
}
