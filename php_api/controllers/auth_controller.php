<?php
/**
 * Auth Controller
 */
require_once __DIR__ . '/../repositories/employee_repository.php';

class AuthController {
    private $db;
    private $employeeRepo;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->employeeRepo = new EmployeeRepository($dbConnection);
    }

    public function login($input) {
        if (empty($input['email']) || empty($input['password'])) {
            ApiResponse::error('البريد الإلكتروني وكلمة المرور مطلوبان.', 400);
            return;
        }

        $email = trim($input['email']);
        $password = trim($input['password']);
        $tenantId = $input['tenantId'] ?? null;
        $companyId = isset($input['companyId']) ? (int)$input['companyId'] : null;
        $deviceId = $input['deviceId'] ?? 'UUID-UNKNOWN';

        if (empty($tenantId) || empty($companyId)) {
            ApiResponse::error('يرجى تحديد مساحة العمل والشركة بشكل صحيح.', 400);
            return;
        }

        // Strict Tenant-Scoped Authentication Search (tenantId + companyId + normalized email)
        $account = $this->employeeRepo->getAuthAccountByTenantCompanyEmail($tenantId, $companyId, $email);

        if (!$account) {
            ApiResponse::error('حساب الموظف غير موجود في هذه الشركة.', 404);
            return;
        }

        // 1. Verify Company Status
        if (($account['company_status'] ?? 'active') !== 'active') {
            ApiResponse::error('الشركة غير نشطة أو معطلة حالياً.', 403);
            return;
        }

        // 2. Verify Employee Status
        if (($account['employee_status'] ?? 'active') !== 'active') {
            ApiResponse::error('حساب الموظف غير نشط أو معطل.', 403);
            return;
        }

        // 3. Verify Account Enabled Flag
        if ((int)($account['account_enabled'] ?? 1) !== 1) {
            ApiResponse::error('تم تعطيل حساب تسجيل الدخول الخاص بك. يرجى مراجعة إدارة الموارد البشرية.', 403);
            return;
        }

        // 4. Verify Password Hash
        if (!password_verify($password, $account['password_hash'])) {
            ApiResponse::error('البريد الإلكتروني أو كلمة المرور غير صحيحة.', 401);
            return;
        }

        $this->employeeRepo->updateLastLogin($account['employee_id']);

        // Generate JWT Access and Refresh Tokens
        $tokenPayload = [
            'userId' => (int)$account['employee_id'],
            'employeeId' => (int)$account['employee_id'],
            'companyId' => (int)$account['company_id'],
            'tenantId' => $account['tenant_id'],
            'role' => $account['role'] ?? 'employee',
            'exp' => time() + 3600 // Short-lived 1-hour access token
        ];
        $accessToken = base64_encode(json_encode($tokenPayload));
        
        $rawRefreshToken = bin2hex(random_bytes(32));
        $refreshTokenHash = hash('sha256', $rawRefreshToken);
        $refreshExpiresAt = date('Y-m-d H:i:s', time() + (86400 * 7));

        // Create server-side session in user_sessions table with hashed refresh token
        $stmt = $this->db->prepare("
            INSERT INTO user_sessions (user_id, employee_id, tenant_id, company_id, refresh_token_hash, device_id, expires_at)
            VALUES (:userId, :employeeId, :tenantId, :companyId, :tokenHash, :deviceId, :expiresAt)
        ");
        $stmt->execute([
            'userId' => (int)$account['employee_id'],
            'employeeId' => (int)$account['employee_id'],
            'tenantId' => $account['tenant_id'],
            'companyId' => (int)$account['company_id'],
            'tokenHash' => $refreshTokenHash,
            'deviceId' => $deviceId,
            'expiresAt' => $refreshExpiresAt
        ]);

        ApiResponse::success([
            'accessToken' => $accessToken,
            'refreshToken' => $rawRefreshToken,
            'token' => $accessToken,
            'userId' => (int)$account['employee_id'],
            'employeeId' => (int)$account['employee_id'],
            'id' => (int)$account['employee_id'],
            'companyId' => (int)$account['company_id'],
            'tenantId' => $account['tenant_id'],
            'mustChangePassword' => (bool)($account['must_change_password'] ?? false),
            'employee_number' => $account['employee_number'],
            'first_name' => $account['first_name'],
            'last_name' => $account['last_name'],
            'email' => $account['email'],
            'role' => $account['role'] ?? 'employee',
            'permissions' => ['view_own_profile', 'punch_attendance', 'request_leaves']
        ], 'تم تسجيل الدخول بنجاح');
    }

    public function refreshToken($input) {
        $rawRefreshToken = $input['refreshToken'] ?? '';
        $deviceId = $input['deviceId'] ?? 'UUID-UNKNOWN';

        if (empty($rawRefreshToken)) {
            ApiResponse::error('رمز التحديث غير متوفر.', 400);
            return;
        }

        $tokenHash = hash('sha256', $rawRefreshToken);
        $stmt = $this->db->prepare("
            SELECT s.*, u.status as user_status, u.account_enabled as user_account_enabled
            FROM user_sessions s
            JOIN users u ON s.user_id = u.employee_id AND s.tenant_id = u.tenant_id
            WHERE s.refresh_token_hash = :tokenHash AND s.device_id = :deviceId AND s.revoked_at IS NULL
            LIMIT 1
        ");
        $stmt->execute(['tokenHash' => $tokenHash, 'deviceId' => $deviceId]);
        $session = $stmt->fetch();

        if (!$session || strtotime($session['expires_at']) < time() || (int)$session['user_account_enabled'] !== 1) {
            ApiResponse::error('جلسة تسجيل الدخول منتهية أو ملغاة.', 401);
            return;
        }

        // Rotate refresh token: revoke old session and issue new rotated session
        $this->db->prepare("UPDATE user_sessions SET revoked_at = NOW() WHERE id = :id")->execute(['id' => $session['id']]);

        $newRawRefreshToken = bin2hex(random_bytes(32));
        $newTokenHash = hash('sha256', $newRawRefreshToken);
        $refreshExpiresAt = date('Y-m-d H:i:s', time() + (86400 * 7));

        $stmt = $this->db->prepare("
            INSERT INTO user_sessions (user_id, employee_id, tenant_id, company_id, refresh_token_hash, device_id, expires_at)
            VALUES (:userId, :employeeId, :tenantId, :companyId, :tokenHash, :deviceId, :expiresAt)
        ");
        $stmt->execute([
            'userId' => $session['user_id'],
            'employeeId' => $session['employee_id'],
            'tenantId' => $session['tenant_id'],
            'companyId' => $session['company_id'],
            'tokenHash' => $newTokenHash,
            'deviceId' => $deviceId,
            'expiresAt' => $refreshExpiresAt
        ]);

        $tokenPayload = [
            'userId' => (int)$session['employee_id'],
            'employeeId' => (int)$session['employee_id'],
            'companyId' => (int)$session['company_id'],
            'tenantId' => $session['tenant_id'],
            'exp' => time() + 3600
        ];
        $newAccessToken = base64_encode(json_encode($tokenPayload));

        ApiResponse::success([
            'accessToken' => $newAccessToken,
            'refreshToken' => $newRawRefreshToken
        ], 'تم تحديث التوكن بنجاح');
    }

    public function logout($input) {
        $rawRefreshToken = $input['refreshToken'] ?? '';
        $deviceId = $input['deviceId'] ?? '';

        if (!empty($rawRefreshToken)) {
            $tokenHash = hash('sha256', $rawRefreshToken);
            $stmt = $this->db->prepare("UPDATE user_sessions SET revoked_at = NOW() WHERE refresh_token_hash = :hash");
            $stmt->execute(['hash' => $tokenHash]);
        } elseif (!empty($deviceId)) {
            $stmt = $this->db->prepare("UPDATE user_sessions SET revoked_at = NOW() WHERE device_id = :dev");
            $stmt->execute(['dev' => $deviceId]);
        }

        ApiResponse::success(null, 'تم تسجيل الخروج بنجاح');
    }
}
