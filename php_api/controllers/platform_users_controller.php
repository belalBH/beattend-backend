<?php
/**
 * PlatformUsersController - Manage Platform Super Admin Users & Granular Platform RBAC
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class PlatformUsersController {

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

    public function getUsers() {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->query("
            SELECT id, email, full_name, is_platform_superadmin, global_status, created_at
            FROM users
            WHERE is_platform_superadmin = 1 OR id = 1
            ORDER BY id ASC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $platformPermissions = [
            'platform.dashboard.view' => 'عرض اللوحة التنفيذية',
            'platform.tenants.manage' => 'إدارة التينانت والشركات',
            'platform.plans.manage' => 'إدارة الباقات والأسعار',
            'platform.subscriptions.manage' => 'إدارة الاشتراكات والتجديد',
            'platform.support.manage' => 'إدارة التذاكر والدعم الفني',
            'platform.settings.manage' => 'إدارة إعدادات المنصة'
        ];

        foreach ($users as &$u) {
            $u['role_title'] = $u['id'] == 1 ? 'Platform Super Admin (الرئيسي)' : 'Platform Admin / Support';
            $u['permissions'] = array_keys($platformPermissions);
        }

        ApiResponse::success([
            'users' => $users,
            'available_permissions' => $platformPermissions
        ], 'تم استرجاع قائمة مستخدمي المنصة والصلاحيات بنجاح');
    }

    public function createUser($input) {
        $this->verifyPlatformSuperAdmin();

        $email = trim($input['email'] ?? '');
        $fullName = trim($input['full_name'] ?? '');
        $password = trim($input['password'] ?? 'Admin@2026!');

        if (empty($email) || empty($fullName)) {
            ApiResponse::error('البريد والاسم الكامل حقول إجبارية', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        try {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("
                INSERT INTO users (email, password_hash, full_name, is_platform_superadmin, global_status)
                VALUES (:email, :hash, :name, 1, 'active')
            ");
            $stmt->execute([
                ':email' => $email,
                ':hash' => $hash,
                ':name' => $fullName
            ]);

            $userId = $pdo->lastInsertId();
            ApiResponse::success(['user_id' => $userId], 'تم إضافة مستخدم المنصة وتعيين صلاحيات السوبر أدمن بنجاح', 201);

        } catch (Exception $e) {
            ApiResponse::error('فشل إضافة المستخدم: ' . $e->getMessage(), 500);
        }
    }
}
