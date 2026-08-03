<?php
/**
 * PlatformController - Dedicated Super Admin Platform Namespace (/api/platform/tenants)
 * Transactional Single-Step Onboarding Engine & Platform Security Guard
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class PlatformController {

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
            'message' => '⚠️ 401 Unauthorized: تطلب هذا الإجراء صلاحيات Platform Super Admin ومعرف مجهول مرفوض',
            'errors' => ['SUPERADMIN_AUTH_REQUIRED'],
            'timestamp' => date('c')
        ]);
        exit;
    }

    public function getTenants() {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->query("
            SELECT t.tenant_id, t.company_code, t.slug, t.subdomain, t.status, t.created_at,
                   c.name_ar AS company_name, c.cr_number, c.tax_number,
                   s.id AS subscription_id, s.start_date, s.end_date, s.status AS subscription_status,
                   p.name_ar AS plan_name, p.max_admin_users, p.max_employees, p.max_branches,
                   (SELECT COUNT(*) FROM employees e WHERE e.tenant_id = t.tenant_id) AS current_employees_count
            FROM tenants t
            LEFT JOIN companies c ON c.tenant_id = t.tenant_id
            LEFT JOIN subscriptions s ON s.tenant_id = t.tenant_id
            LEFT JOIN subscription_plans p ON p.id = s.plan_id
            ORDER BY t.created_at DESC
        ");

        ApiResponse::success($stmt->fetchAll(PDO::FETCH_ASSOC), 'تم استرجاع قائمة منشآت المنصة بنجاح');
    }

    public function createTenant($input) {
        $this->verifyPlatformSuperAdmin();

        $companyName = trim($input['company_name'] ?? '');
        $companyCode = strtoupper(trim($input['company_code'] ?? ''));
        $adminEmail = trim($input['admin_email'] ?? '');
        $planId = (int)($input['plan_id'] ?? 2);

        if (empty($companyName) || empty($companyCode) || empty($adminEmail)) {
            ApiResponse::error('اسم الشركة، رمز المنشأة، والبريد الإلكتروني للأدمن حقول إجبارية', 400);
            return;
        }

        $slug = strtolower($companyCode);
        $subdomain = $slug . '.beattend.com';
        $tenantId = 'tenant-' . $slug . '-' . rand(100, 999);

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // REQUIREMENT 4: PDO ALL-IN-ONE TRANSACTION WITH COMPLETE ROLLBACK ON FAILURE
        try {
            $pdo->beginTransaction();

            // 1. Insert Tenant Record
            $tStmt = $pdo->prepare("
                INSERT INTO tenants (tenant_id, company_code, slug, subdomain, status, created_at)
                VALUES (:tenant_id, :company_code, :slug, :subdomain, 'active', NOW())
            ");
            $tStmt->execute([
                ':tenant_id' => $tenantId,
                ':company_code' => $companyCode,
                ':slug' => $slug,
                ':subdomain' => $subdomain
            ]);

            // 2. Insert Company Profile
            $cStmt = $pdo->prepare("
                INSERT INTO companies (tenant_id, name, name_ar, name_en, is_active, created_at)
                VALUES (:tenant_id, :name, :name_ar, :name_en, 1, NOW())
            ");
            $cStmt->execute([
                ':tenant_id' => $tenantId,
                ':name' => $companyName,
                ':name_ar' => $companyName,
                ':name_en' => $input['company_name_en'] ?? $companyName
            ]);
            $companyId = $pdo->lastInsertId();

            // 3. Insert Subscription Record
            $sStmt = $pdo->prepare("
                INSERT INTO subscriptions (tenant_id, plan_id, start_date, end_date, max_admin_users, max_employees, max_branches, status)
                VALUES (:tenant_id, :plan_id, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 10, 200, 5, 'active')
            ");
            $sStmt->execute([
                ':tenant_id' => $tenantId,
                ':plan_id' => $planId
            ]);

            // 4. Create or Fetch Company Admin User
            $uStmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1");
            $uStmt->execute([':email' => $adminEmail]);
            $existingUser = $uStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingUser) {
                $userId = $existingUser['id'];
            } else {
                $instUser = $pdo->prepare("
                    INSERT INTO users (email, password_hash, full_name, is_platform_superadmin, global_status)
                    VALUES (:email, :hash, :name, 0, 'active')
                ");
                $tempHash = password_hash(bin2hex(random_bytes(8)), PASSWORD_BCRYPT);
                $instUser->execute([
                    ':email' => $adminEmail,
                    ':hash' => $tempHash,
                    ':name' => "Company Admin ($companyCode)"
                ]);
                $userId = $pdo->lastInsertId();
            }

            // 5. Create Tenant Membership
            $mStmt = $pdo->prepare("
                INSERT INTO tenant_memberships (user_id, tenant_id, status, joined_at)
                VALUES (:user_id, :tenant_id, 'active', NOW())
            ");
            $mStmt->execute([
                ':user_id' => $userId,
                ':tenant_id' => $tenantId
            ]);
            $membershipId = $pdo->lastInsertId();

            // 6. Assign Company Admin Role (Role 2)
            $rStmt = $pdo->prepare("INSERT INTO user_roles (membership_id, role_id) VALUES (:membership_id, 2)");
            $rStmt->execute([':membership_id' => $membershipId]);

            // 7. Generate Secure Invitation Token (Requirement 5)
            $invToken = bin2hex(random_bytes(32));
            $invStmt = $pdo->prepare("
                INSERT INTO invitations (tenant_id, email, role_id, token, expires_at, status)
                VALUES (:tenant_id, :email, 2, :token, DATE_ADD(NOW(), INTERVAL 7 DAY), 'pending')
            ");
            $invStmt->execute([
                ':tenant_id' => $tenantId,
                ':email' => $adminEmail,
                ':token' => $invToken
            ]);

            // 8. Log Platform Action in Audit Logs
            $auditStmt = $pdo->prepare("
                INSERT INTO audit_logs (tenant_id, user_id, action, resource, ip_address, details)
                VALUES (:tenant_id, 1, 'PLATFORM_TENANT_CREATED', 'TENANTS', :ip, :details)
            ");
            $auditStmt->execute([
                ':tenant_id' => $tenantId,
                ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                ':details' => "إنشاء المنشأة بنجاح: {$companyCode} - {$companyName} عبر السوبر أدمن"
            ]);

            // COMMIT TRANSACTION
            $pdo->commit();

            ApiResponse::success([
                'tenant_id' => $tenantId,
                'company_code' => $companyCode,
                'slug' => $slug,
                'subdomain' => $subdomain,
                'company_name' => $companyName,
                'admin_email' => $adminEmail,
                'invitation_token' => $invToken,
                'activation_url' => "http://staging.beattend.com/?page=activate&token={$invToken}#activate"
            ], 'تم إنشاء المنشأة وتجهيز الحساب ورابط التفعيل بنجاح', 201);

        } catch (Exception $e) {
            // ROLLBACK ALL CHANGES ON FAILURE
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            ApiResponse::error('فشل إنشاء الشركة (تم إلغاء كافة التغييرات Rollback): ' . $e->getMessage(), 500);
        }
    }
}
