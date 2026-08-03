<?php
/**
 * InvitationController - Secure Account Activation & Token Verification Engine
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class InvitationController {

    public function verifyToken($token) {
        if (empty($token)) {
            ApiResponse::error('رمز التفعيل (Token) مطلوب', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT i.*, t.company_code, t.subdomain, c.name_ar AS company_name
            FROM invitations i
            JOIN tenants t ON t.tenant_id = i.tenant_id
            LEFT JOIN companies c ON c.tenant_id = t.tenant_id
            WHERE i.token = :token AND i.status = 'pending' AND i.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([':token' => $token]);
        $invitation = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$invitation) {
            ApiResponse::error('رمز التفعيل غير صالحة أو منتهي الصلاحية', 404);
            return;
        }

        ApiResponse::success([
            'email' => $invitation['email'],
            'company_code' => $invitation['company_code'],
            'company_name' => $invitation['company_name'],
            'subdomain' => $invitation['subdomain'],
            'expires_at' => $invitation['expires_at']
        ], 'رمز التفعيل صالح وجاهز لضبط كلمة المرور');
    }

    public function activateAccount($input) {
        $token = trim($input['token'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($token) || strlen($password) < 6) {
            ApiResponse::error('يرجى تقديم رمز التفعيل وكلمة مرور لا تقل عن 6 خانات', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT i.*, u.id AS user_id, t.company_code
            FROM invitations i
            JOIN users u ON LOWER(u.email) = LOWER(i.email)
            JOIN tenants t ON t.tenant_id = i.tenant_id
            WHERE i.token = :token AND i.status = 'pending' AND i.expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([':token' => $token]);
        $invitation = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$invitation) {
            ApiResponse::error('تعذر تفعيل الحساب: رابط التفعيل غير صالح أو تم استخدامه سابقاً', 400);
            return;
        }

        try {
            $pdo->beginTransaction();

            // 1. Hash & Update User Password
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $uStmt = $pdo->prepare("UPDATE users SET password_hash = :hash, global_status = 'active' WHERE id = :id");
            $uStmt->execute([':hash' => $hash, ':id' => $invitation['user_id']]);

            // 2. Update Invitation Status
            $iStmt = $pdo->prepare("UPDATE invitations SET status = 'accepted' WHERE id = :id");
            $iStmt->execute([':id' => $invitation['id']]);

            // 3. Update Membership Status
            $mStmt = $pdo->prepare("UPDATE tenant_memberships SET status = 'active' WHERE user_id = :u_id AND tenant_id = :t_id");
            $mStmt->execute([':u_id' => $invitation['user_id'], ':t_id' => $invitation['tenant_id']]);

            // 4. Audit Log
            $auditStmt = $pdo->prepare("
                INSERT INTO audit_logs (tenant_id, user_id, action, resource, ip_address, details)
                VALUES (:tenant_id, :user_id, 'USER_ACCOUNT_ACTIVATED', 'INVITATIONS', :ip, :details)
            ");
            $auditStmt->execute([
                ':tenant_id' => $invitation['tenant_id'],
                ':user_id' => $invitation['user_id'],
                ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                ':details' => "تم تفعيل حساب المستخدم {$invitation['email']} وتعيين كلمة المرور بنجاح"
            ]);

            $pdo->commit();

            ApiResponse::success([
                'email' => $invitation['email'],
                'company_code' => $invitation['company_code']
            ], 'تم تفعيل الحساب وتعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.');

        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            ApiResponse::error('حدث خطأ أثناء تفعيل الحساب: ' . $e->getMessage(), 500);
        }
    }
}
