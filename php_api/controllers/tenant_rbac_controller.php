<?php
/**
 * TenantRbacController - Multi-Role Engine (Many-to-Many), Data Scope Evaluator & Permission Matrix
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class TenantRbacController {

    public static function getEffectivePermissions($membershipId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT DISTINCT p.code
            FROM membership_roles mr
            JOIN role_permissions rp ON rp.role_id = mr.role_id
            JOIN permissions p ON p.id = rp.permission_id
            WHERE mr.membership_id = :mem_id
        ");
        $stmt->execute([':mem_id' => $membershipId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public static function getDataScope($membershipId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // 1. Scope Type
        $sStmt = $pdo->prepare("SELECT scope_type FROM user_data_scopes WHERE membership_id = :mem_id LIMIT 1");
        $sStmt->execute([':mem_id' => $membershipId]);
        $scopeType = $sStmt->fetchColumn() ?: 'all_company';

        // 2. Allowed Branches
        $bStmt = $pdo->prepare("SELECT branch_id FROM user_branch_access WHERE membership_id = :mem_id");
        $bStmt->execute([':mem_id' => $membershipId]);
        $allowedBranches = $bStmt->fetchAll(PDO::FETCH_COLUMN);

        // 3. Allowed Departments
        $dStmt = $pdo->prepare("SELECT department_id FROM user_department_access WHERE membership_id = :mem_id");
        $dStmt->execute([':mem_id' => $membershipId]);
        $allowedDepts = $dStmt->fetchAll(PDO::FETCH_COLUMN);

        return [
            'scope_type' => $scopeType,
            'allowed_branches' => array_map('intval', $allowedBranches),
            'allowed_departments' => array_map('intval', $allowedDepts)
        ];
    }

    public static function getEnabledFeatures($tenantId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("SELECT feature_code, is_enabled FROM tenant_features WHERE tenant_id = :t_id");
        $stmt->execute([':t_id' => $tenantId]);
        $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Default all true if not set
        $defaults = [
            'employees' => true,
            'leaves' => true,
            'attendance' => true,
            'reports' => true,
            'settings' => true,
            'geofencing' => true,
            'payroll' => true,
            'leave_types' => true
        ];

        foreach ($rows as $code => $enabled) {
            $defaults[$code] = (bool)$enabled;
        }

        return $defaults;
    }

    public function getUsers($tenantId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT tm.id AS membership_id, u.id AS user_id, u.email, u.full_name, u.phone,
                   tm.employee_id, tm.status AS membership_status, tm.joined_at,
                   (
                     SELECT GROUP_CONCAT(r.name_ar SEPARATOR ', ')
                     FROM membership_roles mr
                     JOIN roles r ON r.id = mr.role_id
                     WHERE mr.membership_id = tm.id
                   ) AS assigned_roles_str
            FROM tenant_memberships tm
            JOIN users u ON u.id = tm.user_id
            WHERE tm.tenant_id = :t_id
            ORDER BY tm.joined_at DESC
        ");
        $stmt->execute([':t_id' => $tenantId]);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($users as &$user) {
            $user['data_scope'] = self::getDataScope($user['membership_id']);
            $user['permissions'] = self::getEffectivePermissions($user['membership_id']);
        }

        ApiResponse::success($users, 'تم استرجاع مستخدمي الإدارة بالشركة بنجاح');
    }

    public function createUser($tenantId, $input) {
        $email = trim($input['email'] ?? '');
        $fullName = trim($input['full_name'] ?? '');
        $password = $input['password'] ?? '12345678';
        $roleIds = $input['role_ids'] ?? (isset($input['role_id']) ? [$input['role_id']] : [2]);
        $scopeType = $input['scope_type'] ?? 'all_company';
        $branchIds = $input['branch_ids'] ?? [];
        $deptIds = $input['department_ids'] ?? [];

        if (empty($email) || empty($fullName)) {
            ApiResponse::error('الاسم الكامل والبريد الإلكتروني حقول إجبارية', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // 1. Check Tenant Subscription Plan Limit for Admin Users
        $subStmt = $pdo->prepare("
            SELECT s.max_admin_users,
                   (SELECT COUNT(*) FROM tenant_memberships WHERE tenant_id = :t1 AND status = 'active') AS current_admins
            FROM subscriptions s
            WHERE s.tenant_id = :t2 AND s.status = 'active'
            LIMIT 1
        ");
        $subStmt->execute([':t1' => $tenantId, ':t2' => $tenantId]);
        $sub = $subStmt->fetch(PDO::FETCH_ASSOC);

        if ($sub && (int)$sub['current_admins'] >= (int)$sub['max_admin_users']) {
            ApiResponse::error("⚠️ تم الوصول للحد الأقصى المسموح به لمستخدمي الإدارة في الباقة ({$sub['max_admin_users']} مستخدم)", 403);
            return;
        }

        try {
            $pdo->beginTransaction();

            // 2. Create or Get User
            $uStmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1");
            $uStmt->execute([':email' => $email]);
            $existingUser = $uStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingUser) {
                $userId = $existingUser['id'];
            } else {
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $insUser = $pdo->prepare("INSERT INTO users (email, password_hash, full_name, phone, global_status) VALUES (:e, :h, :n, :p, 'active')");
                $insUser->execute([':e' => $email, ':h' => $hash, ':n' => $fullName, ':p' => $input['phone'] ?? null]);
                $userId = $pdo->lastInsertId();
            }

            // 3. Create Membership
            $mStmt = $pdo->prepare("INSERT INTO tenant_memberships (user_id, tenant_id, employee_id, status) VALUES (:u, :t, :emp, 'active')");
            $mStmt->execute([':u' => $userId, ':t' => $tenantId, ':emp' => $input['employee_id'] ?? null]);
            $membershipId = $pdo->lastInsertId();

            // 4. Assign Many-to-Many Roles
            $mrStmt = $pdo->prepare("INSERT IGNORE INTO membership_roles (membership_id, role_id) VALUES (:m, :r)");
            foreach ($roleIds as $rId) {
                $mrStmt->execute([':m' => $membershipId, ':r' => (int)$rId]);
            }

            // 5. Create Data Scope Definition
            $dsStmt = $pdo->prepare("INSERT INTO user_data_scopes (membership_id, scope_type) VALUES (:m, :st) ON DUPLICATE KEY UPDATE scope_type=VALUES(scope_type)");
            $dsStmt->execute([':m' => $membershipId, ':st' => $scopeType]);

            // 6. Branch & Department Bindings
            if ($scopeType === 'selected_branches' && !empty($branchIds)) {
                $bIns = $pdo->prepare("INSERT IGNORE INTO user_branch_access (membership_id, branch_id) VALUES (:m, :b)");
                foreach ($branchIds as $bId) {
                    $bIns->execute([':m' => $membershipId, ':b' => (int)$bId]);
                }
            }

            if ($scopeType === 'selected_departments' && !empty($deptIds)) {
                $dIns = $pdo->prepare("INSERT IGNORE INTO user_department_access (membership_id, department_id) VALUES (:m, :d)");
                foreach ($deptIds as $dId) {
                    $dIns->execute([':m' => $membershipId, ':d' => (int)$dId]);
                }
            }

            $pdo->commit();
            ApiResponse::success(['membership_id' => $membershipId, 'user_id' => $userId], 'تم إضافة المستخدم وتخصيص الأدوار ونطاق الوصول بنجاح', 201);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            ApiResponse::error('فشل إضافة المستخدم: ' . $e->getMessage(), 500);
        }
    }

    public function getRoles($tenantId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT r.*,
                   (SELECT COUNT(*) FROM membership_roles mr WHERE mr.role_id = r.id) AS assigned_users_count
            FROM roles r
            WHERE r.tenant_id = :t_id OR r.tenant_id IS NULL
            ORDER BY r.is_default DESC, r.id ASC
        ");
        $stmt->execute([':t_id' => $tenantId]);
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($roles as &$role) {
            $pStmt = $pdo->prepare("SELECT permission_id FROM role_permissions WHERE role_id = :r_id");
            $pStmt->execute([':r_id' => $role['id']]);
            $role['permission_ids'] = array_map('intval', $pStmt->fetchAll(PDO::FETCH_COLUMN));
        }

        ApiResponse::success($roles, 'تم استرجاع قائمة الأدوار بنجاح');
    }

    public function createRole($tenantId, $input) {
        $nameAr = trim($input['name_ar'] ?? '');
        $permissionIds = $input['permission_ids'] ?? [];

        if (empty($nameAr)) {
            ApiResponse::error('اسم الدور بالعربية مطلوب', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO roles (tenant_id, name_ar, name_en, description, is_default, is_active) VALUES (:t, :nar, :nen, :desc, 0, 1)");
            $stmt->execute([
                ':t' => $tenantId,
                ':nar' => $nameAr,
                ':nen' => $input['name_en'] ?? $nameAr,
                ':desc' => $input['description'] ?? null
            ]);
            $roleId = $pdo->lastInsertId();

            if (!empty($permissionIds)) {
                $rpStmt = $pdo->prepare("INSERT INTO role_permissions (role_id, permission_id) VALUES (:r, :p)");
                foreach ($permissionIds as $pId) {
                    $rpStmt->execute([':r' => $roleId, ':p' => (int)$pId]);
                }
            }

            $pdo->commit();
            ApiResponse::success(['role_id' => $roleId], 'تم إنشاء الدور المخصص وتعيين مصفوفة الصلاحيات بنجاح', 201);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            ApiResponse::error('فشل إنشاء الدور: ' . $e->getMessage(), 500);
        }
    }

    public function getModulesAndPermissions() {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $mStmt = $pdo->query("SELECT * FROM permission_modules ORDER BY sort_order ASC");
        $modules = $mStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($modules as &$mod) {
            $pStmt = $pdo->prepare("SELECT id, code, action_type, name_ar, name_en FROM permissions WHERE module_id = :m_id ORDER BY id ASC");
            $pStmt->execute([':m_id' => $mod['id']]);
            $mod['permissions'] = $pStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        ApiResponse::success($modules, 'تم استرجاع وحدات ومصفوفة الصلاحيات الموديلار بنجاح');
    }
}
