<?php
/**
 * PlatformController - Dedicated Super Admin Platform Namespace (/api/platform/tenants)
 * Transactional Single-Step Onboarding Engine & Multi-Tab Tenant Management Guard
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
            'message' => '⚠️ 401 Unauthorized: تطلب هذا الإجراء صلاحيات Platform Super Admin',
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
                   c.id AS company_id, c.name_ar AS company_name, c.cr_number, c.tax_number,
                   s.id AS subscription_id, s.plan_id, s.start_date, s.end_date, s.status AS subscription_status,
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

    public function getTenantDetail($tenantId) {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // 1. Basic Info & Company Profile
        $tStmt = $pdo->prepare("
            SELECT t.tenant_id, t.company_code, t.slug, t.subdomain, t.status, t.created_at,
                   c.id AS company_id, c.name_ar AS company_name, c.name_en AS company_name_en, c.cr_number, c.tax_number,
                   s.id AS subscription_id, s.plan_id, s.start_date, s.end_date, s.status AS subscription_status,
                   p.name_ar AS plan_name, p.price_monthly, p.price_annual, p.max_admin_users, p.max_employees, p.max_branches
            FROM tenants t
            LEFT JOIN companies c ON c.tenant_id = t.tenant_id
            LEFT JOIN subscriptions s ON s.tenant_id = t.tenant_id
            LEFT JOIN subscription_plans p ON p.id = s.plan_id
            WHERE t.tenant_id = :t_id
            LIMIT 1
        ");
        $tStmt->execute([':t_id' => $tenantId]);
        $tenantInfo = $tStmt->fetch(PDO::FETCH_ASSOC);

        if (!$tenantInfo) {
            ApiResponse::error('المنشأة غير موجودة', 404);
            return;
        }

        // 2. Company Admins & Users
        $usersStmt = $pdo->prepare("
            SELECT u.id, u.email, u.full_name, tm.status, tm.joined_at
            FROM tenant_memberships tm
            JOIN users u ON u.id = tm.user_id
            WHERE tm.tenant_id = :t_id
        ");
        $usersStmt->execute([':t_id' => $tenantId]);
        $users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Employees List
        $empStmt = $pdo->prepare("
            SELECT id, employee_code, first_name_ar, last_name_ar, email, phone, job_title, status, created_at
            FROM employees
            WHERE tenant_id = :t_id
            ORDER BY id ASC
        ");
        $empStmt->execute([':t_id' => $tenantId]);
        $employees = $empStmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Enabled Features Override
        $featStmt = $pdo->prepare("
            SELECT pf.code, pf.name_ar, tfo.is_enabled
            FROM platform_features pf
            LEFT JOIN tenant_feature_overrides tfo ON tfo.feature_id = pf.id AND tfo.tenant_id = :t_id
        ");
        $featStmt->execute([':t_id' => $tenantId]);
        $features = $featStmt->fetchAll(PDO::FETCH_ASSOC);

        ApiResponse::success([
            'tenant' => $tenantInfo,
            'users' => $users,
            'employees' => $employees,
            'features' => $features,
            'usage' => [
                'employees_count' => count($employees),
                'max_employees' => (int)($tenantInfo['max_employees'] ?? 200),
                'admins_count' => count($users),
                'max_admin_users' => (int)($tenantInfo['max_admin_users'] ?? 10),
                'storage_used_mb' => 245,
                'max_storage_mb' => 5120
            ]
        ], 'تم استرجاع بيانات المنشأة بالكامل بنجاح');
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

            // 3. Insert Subscription Record
            $sStmt = $pdo->prepare("
                INSERT INTO subscriptions (tenant_id, plan_id, start_date, end_date, max_admin_users, max_employees, max_branches, status)
                VALUES (:tenant_id, :plan_id, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 10, 200, 5, 'active')
            ");
            $sStmt->execute([
                ':tenant_id' => $tenantId,
                ':plan_id' => $planId
            ]);

            // 4. Create Admin User
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

            $pdo->commit();

            ApiResponse::success([
                'tenant_id' => $tenantId,
                'company_code' => $companyCode,
                'slug' => $slug,
                'subdomain' => $subdomain,
                'company_name' => $companyName
            ], 'تم إنشاء المنشأة وتجهيز بيئة العمل بنجاح', 201);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            ApiResponse::error('فشل إنشاء المنشأة: ' . $e->getMessage(), 500);
        }
    }

    public function updateTenantStatus($tenantId, $status) {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $validStatuses = ['active', 'suspended', 'expired'];
        if (!in_array($status, $validStatuses)) {
            ApiResponse::error('حالة غير صالحة', 400);
            return;
        }

        $stmt = $pdo->prepare("UPDATE tenants SET status = :status WHERE tenant_id = :t_id");
        $stmt->execute([':status' => $status, ':t_id' => $tenantId]);

        // Update Subscriptions status
        $sStmt = $pdo->prepare("UPDATE subscriptions SET status = :status WHERE tenant_id = :t_id");
        $sStmt->execute([':status' => $status, ':t_id' => $tenantId]);

        ApiResponse::success(null, "تم تحديث حالة الشركة إلى ({$status}) بنجاح");
    }

    public function updateTenantSubscription($tenantId, $input) {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $planId = (int)($input['plan_id'] ?? 2);
        $addMonths = (int)($input['add_months'] ?? 12);

        $stmt = $pdo->prepare("
            UPDATE subscriptions
            SET plan_id = :plan_id,
                status = 'active',
                end_date = DATE_ADD(GREATEST(end_date, NOW()), INTERVAL :months MONTH)
            WHERE tenant_id = :t_id
        ");
        $stmt->execute([
            ':plan_id' => $planId,
            ':months' => $addMonths,
            ':t_id' => $tenantId
        ]);

        ApiResponse::success(null, 'تم تجديد وترقية اشتراك المنشأة بنجاح');
    }

    public function updateTenantBasicInfo($tenantId, $input) {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $nameAr = trim($input['company_name'] ?? '');
        $crNumber = trim($input['cr_number'] ?? '');
        $taxNumber = trim($input['tax_number'] ?? '');

        if (!empty($nameAr)) {
            $stmt = $pdo->prepare("
                UPDATE companies
                SET name_ar = :name_ar, name = :name, cr_number = :cr, tax_number = :tax
                WHERE tenant_id = :t_id
            ");
            $stmt->execute([
                ':name_ar' => $nameAr,
                ':name' => $nameAr,
                ':cr' => $crNumber,
                ':tax' => $taxNumber,
                ':t_id' => $tenantId
            ]);
        }

        ApiResponse::success(null, 'تم تحديث البيانات الأساسية للشركة بنجاح');
    }
}
