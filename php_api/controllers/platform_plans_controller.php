<?php
/**
 * PlatformPlansController - Complete CRUD for Subscription Plans, Pricing & Modules Matrix
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class PlatformPlansController {

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

    public function getPlans() {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->query("
            SELECT sp.*,
                   (SELECT COUNT(*) FROM subscriptions s WHERE s.plan_id = sp.id AND s.status = 'active') AS active_companies_count
            FROM subscription_plans sp
            WHERE sp.deleted_at IS NULL
            ORDER BY sp.sort_order ASC, sp.id ASC
        ");
        $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($plans as &$p) {
            $p['price_monthly'] = (float)$p['price_monthly'];
            $p['price_annual'] = (float)$p['price_annual'];
            $p['max_employees'] = (int)$p['max_employees'];
            $p['max_admin_users'] = (int)$p['max_admin_users'];
            $p['max_branches'] = (int)$p['max_branches'];
            $p['max_geofences'] = (int)$p['max_geofences'];
            $p['storage_limit_mb'] = (int)$p['storage_limit_mb'];
            $p['is_active'] = (bool)$p['is_active'];
            $p['is_public'] = (bool)$p['is_public'];

            // Fetch Plan Enabled Features
            $fStmt = $pdo->prepare("
                SELECT pf.code
                FROM plan_features plf
                JOIN platform_features pf ON pf.id = plf.feature_id
                WHERE plf.plan_id = :p_id
            ");
            $fStmt->execute([':p_id' => $p['id']]);
            $p['enabled_features'] = $fStmt->fetchAll(PDO::FETCH_COLUMN);
        }

        ApiResponse::success($plans, 'تم استرجاع قائمة الباقات والأسعار بنجاح');
    }

    public function createPlan($input) {
        $this->verifyPlatformSuperAdmin();

        $nameAr = trim($input['name_ar'] ?? '');
        $nameEn = trim($input['name_en'] ?? $nameAr);
        $planCode = strtoupper(trim($input['plan_code'] ?? 'PLAN-' . rand(100, 999)));
        $priceMonthly = (float)($input['price_monthly'] ?? 0.00);
        $priceAnnual = (float)($input['price_annual'] ?? 0.00);
        $featureCodes = $input['enabled_features'] ?? ['employees', 'leaves', 'attendance'];

        if (empty($nameAr)) {
            ApiResponse::error('اسم الباقة بالعربية مطلوب', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
                INSERT INTO subscription_plans (
                  plan_code, name_ar, name_en, description, price_monthly, price_annual,
                  currency, trial_days, max_employees, max_admin_users, max_branches, max_geofences,
                  storage_limit_mb, max_devices, is_active, is_public, sort_order
                ) VALUES (
                  :code, :nar, :nen, :desc, :p_m, :p_a,
                  :curr, :trial, :m_emp, :m_adm, :m_br, :m_geo,
                  :stg, :dev, 1, 1, 1
                )
            ");
            $stmt->execute([
                ':code' => $planCode,
                ':nar' => $nameAr,
                ':nen' => $nameEn,
                ':desc' => $input['description'] ?? null,
                ':p_m' => $priceMonthly,
                ':p_a' => $priceAnnual,
                ':curr' => $input['currency'] ?? 'SAR',
                ':trial' => (int)($input['trial_days'] ?? 14),
                ':m_emp' => (int)($input['max_employees'] ?? 50),
                ':m_adm' => (int)($input['max_admin_users'] ?? 5),
                ':m_br' => (int)($input['max_branches'] ?? 3),
                ':m_geo' => (int)($input['max_geofences'] ?? 5),
                ':stg' => (int)($input['storage_limit_mb'] ?? 5120),
                ':dev' => (int)($input['max_devices'] ?? 10)
            ]);

            $planId = $pdo->lastInsertId();

            // Insert Plan Feature Mappings
            if (!empty($featureCodes)) {
                $pfStmt = $pdo->prepare("
                    INSERT IGNORE INTO plan_features (plan_id, feature_id)
                    SELECT :p_id, id FROM platform_features WHERE code = :f_code
                ");
                foreach ($featureCodes as $code) {
                    $pfStmt->execute([':p_id' => $planId, ':f_code' => $code]);
                }
            }

            $pdo->commit();
            ApiResponse::success(['plan_id' => $planId], 'تم إنشاء الباقة الجديدة وتعيين الحدود والمزايا بنجاح', 201);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            ApiResponse::error('فشل إنشاء الباقة: ' . $e->getMessage(), 500);
        }
    }

    public function updatePlan($id, $input) {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $nameAr = trim($input['name_ar'] ?? '');
        $priceMonthly = (float)($input['price_monthly'] ?? 0.00);
        $priceAnnual = (float)($input['price_annual'] ?? 0.00);
        $featureCodes = $input['enabled_features'] ?? [];

        if (empty($nameAr)) {
            ApiResponse::error('اسم الباقة بالعربية مطلوب', 400);
            return;
        }

        try {
            $pdo->beginTransaction();

            // Fetch Current Plan to check Price Revision
            $curStmt = $pdo->prepare("SELECT price_monthly, price_annual FROM subscription_plans WHERE id = :id LIMIT 1");
            $curStmt->execute([':id' => $id]);
            $currentPlan = $curStmt->fetch(PDO::FETCH_ASSOC);

            if ($currentPlan && ((float)$currentPlan['price_monthly'] !== $priceMonthly || (float)$currentPlan['price_annual'] !== $priceAnnual)) {
                // Log Price Revision History
                $histStmt = $pdo->prepare("
                    INSERT INTO plan_price_history (plan_id, old_price_monthly, new_price_monthly, old_price_annual, new_price_annual, reason, changed_by)
                    VALUES (:pid, :old_m, :new_m, :old_a, :new_a, 'تحديث سعر الباقة من لوحة المنصة', 1)
                ");
                $histStmt->execute([
                    ':pid' => $id,
                    ':old_m' => $currentPlan['price_monthly'],
                    ':new_m' => $priceMonthly,
                    ':old_a' => $currentPlan['price_annual'],
                    ':new_a' => $priceAnnual
                ]);
            }

            $stmt = $pdo->prepare("
                UPDATE subscription_plans SET
                  name_ar = :nar,
                  name_en = :nen,
                  description = :desc,
                  price_monthly = :p_m,
                  price_annual = :p_a,
                  max_employees = :m_emp,
                  max_admin_users = :m_adm,
                  max_branches = :m_br,
                  max_geofences = :m_geo,
                  storage_limit_mb = :stg,
                  is_active = :act,
                  is_public = :pub
                WHERE id = :id
            ");

            $stmt->execute([
                ':nar' => $nameAr,
                ':nen' => trim($input['name_en'] ?? $nameAr),
                ':desc' => $input['description'] ?? null,
                ':p_m' => $priceMonthly,
                ':p_a' => $priceAnnual,
                ':m_emp' => (int)($input['max_employees'] ?? 50),
                ':m_adm' => (int)($input['max_admin_users'] ?? 5),
                ':m_br' => (int)($input['max_branches'] ?? 3),
                ':m_geo' => (int)($input['max_geofences'] ?? 5),
                ':stg' => (int)($input['storage_limit_mb'] ?? 5120),
                ':act' => isset($input['is_active']) ? ((bool)$input['is_active'] ? 1 : 0) : 1,
                ':pub' => isset($input['is_public']) ? ((bool)$input['is_public'] ? 1 : 0) : 1,
                ':id' => $id
            ]);

            // Update Plan Features Map
            if (!empty($featureCodes)) {
                $delStmt = $pdo->prepare("DELETE FROM plan_features WHERE plan_id = :id");
                $delStmt->execute([':id' => $id]);

                $pfStmt = $pdo->prepare("
                    INSERT IGNORE INTO plan_features (plan_id, feature_id)
                    SELECT :p_id, id FROM platform_features WHERE code = :f_code
                ");
                foreach ($featureCodes as $code) {
                    $pfStmt->execute([':p_id' => $id, ':f_code' => $code]);
                }
            }

            $pdo->commit();
            ApiResponse::success(null, 'تم تحديث بيانات الباقة وتسجيل تاريخ تغير الأسعار بنجاح');

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            ApiResponse::error('فشل تحديث الباقة: ' . $e->getMessage(), 500);
        }
    }

    public function deletePlan($id) {
        $this->verifyPlatformSuperAdmin();
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // Check if plan has active subscriptions
        $chkStmt = $pdo->prepare("SELECT COUNT(*) FROM subscriptions WHERE plan_id = :id AND status = 'active'");
        $chkStmt->execute([':id' => $id]);
        $activeSubsCount = (int)$chkStmt->fetchColumn();

        if ($activeSubsCount > 0) {
            ApiResponse::error("⚠️ لا يمكن حذف الباقة لأنها مرتبطة بـ ({$activeSubsCount}) شركات مشتركة حالياً. يمكنك تعطيل الباقة بدلاً من الحذف.", 400);
            return;
        }

        $stmt = $pdo->prepare("UPDATE subscription_plans SET deleted_at = NOW() WHERE id = :id");
        $stmt->execute([':id' => $id]);
        ApiResponse::success(null, 'تم حذف الباقة بنجاح');
    }
}
