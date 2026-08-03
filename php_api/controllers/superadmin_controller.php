<?php
/**
 * Super Admin Controller - Platform Administration & Multi-Tenant Onboarding Engine
 */
class SuperAdminController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function getTenants() {
        try {
            $stmt = $this->db->prepare("
                SELECT t.*, c.name_ar AS company_name, c.name_en AS company_name_en, c.cr_number, c.tax_number,
                       s.id AS subscription_id, s.start_date, s.end_date, s.status AS subscription_status,
                       sp.name_ar AS plan_name, sp.max_admin_users, sp.max_employees, sp.max_branches,
                       (SELECT COUNT(*) FROM employees e WHERE e.tenant_id = t.tenant_id) AS current_employees_count
                FROM tenants t
                LEFT JOIN companies c ON t.tenant_id = c.tenant_id
                LEFT JOIN subscriptions s ON t.tenant_id = s.tenant_id AND s.status = 'active'
                LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
                ORDER BY t.created_at DESC
            ");
            $stmt->execute();
            $tenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($tenants as &$t) {
                $t['current_employees_count'] = (int)$t['current_employees_count'];
                $t['max_employees'] = (int)($t['max_employees'] ?: 50);
                $t['max_admin_users'] = (int)($t['max_admin_users'] ?: 5);
                $t['max_branches'] = (int)($t['max_branches'] ?: 3);
            }

            ApiResponse::send($tenants, 'تم استرجاع قائمة منشآت المنصة بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب قائمة المنشآت: ' . $e->getMessage(), 500);
        }
    }

    public function onboardTenant($input) {
        try {
            $companyName = trim($input['company_name'] ?? '');
            $code = strtoupper(trim($input['company_code'] ?? ''));
            $email = trim($input['admin_email'] ?? '');
            $planId = (int)($input['plan_id'] ?? 2);

            if (empty($companyName) || empty($code) || empty($email)) {
                ApiResponse::error('اسم الشركة، رمز الشركة، والبريد الإلكتروني حقول إجبارية', 400);
                return;
            }

            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $code));
            if (empty($slug)) $slug = 'comp' . rand(100, 999);
            $subdomain = $slug . '.beattend.com';
            $tenantId = 'tenant-' . $slug . '-' . rand(100, 999);

            $this->db->beginTransaction();

            // 1. Insert Tenant Record
            $stmtT = $this->db->prepare("
                INSERT INTO tenants (tenant_id, company_code, slug, subdomain, status, created_at)
                VALUES (:t, :c, :s, :sub, 'active', NOW())
            ");
            $stmtT->execute([
                't' => $tenantId,
                'c' => $code,
                's' => $slug,
                'sub' => $subdomain
            ]);

            // 2. Insert Company Record
            $stmtC = $this->db->prepare("
                INSERT INTO companies (tenant_id, name, name_ar, is_active, created_at)
                VALUES (:t, :n, :nar, 1, NOW())
            ");
            $stmtC->execute([
                't' => $tenantId,
                'n' => $code . ' HQ',
                'nar' => $companyName
            ]);
            $companyId = (int)$this->db->lastInsertId();

            // 3. Create Subscription
            $stmtPlan = $this->db->prepare("SELECT * FROM subscription_plans WHERE id = :p");
            $stmtPlan->execute(['p' => $planId]);
            $plan = $stmtPlan->fetch(PDO::FETCH_ASSOC);

            $maxAdmins = $plan ? (int)$plan['max_admin_users'] : 10;
            $maxEmps = $plan ? (int)$plan['max_employees'] : 200;
            $maxBranches = $plan ? (int)$plan['max_branches'] : 5;

            $stmtS = $this->db->prepare("
                INSERT INTO subscriptions (tenant_id, plan_id, start_date, end_date, max_admin_users, max_employees, max_branches, status, created_at)
                VALUES (:t, :p, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), :ma, :me, :mb, 'active', NOW())
            ");
            $stmtS->execute([
                't' => $tenantId,
                'p' => $planId,
                'ma' => $maxAdmins,
                'me' => $maxEmps,
                'mb' => $maxBranches
            ]);

            // 4. Create Initial Seed Employee for Company Admin
            $stmtE = $this->db->prepare("
                INSERT INTO employees (tenant_id, company_id, branch_id, department_id, employee_number, first_name, last_name, email, job_title, is_active, created_at)
                VALUES (:t, :c, 1, 1, :empNo, :fn, :ln, :email, 'مدير المنشأة', 1, NOW())
            ");
            $stmtE->execute([
                't' => $tenantId,
                'c' => $companyId,
                'empNo' => 'ADM-001',
                'fn' => 'مدير',
                'ln' => $companyName,
                'email' => $email
            ]);

            // 5. Record Audit Log
            $stmtA = $this->db->prepare("
                INSERT INTO audit_logs (tenant_id, action, resource, details, created_at)
                VALUES (:t, 'TENANT_ONBOARDED', 'tenants', :details, NOW())
            ");
            $stmtA->execute([
                't' => $tenantId,
                'details' => json_encode(['company_name' => $companyName, 'code' => $code, 'subdomain' => $subdomain])
            ]);

            $this->db->commit();

            ApiResponse::send([
                'tenant_id' => $tenantId,
                'company_code' => $code,
                'slug' => $slug,
                'subdomain' => $subdomain,
                'company_name' => $companyName,
                'admin_email' => $email
            ], 'تم إنشاء المنشأة وتجهيز الـ Subdomain وحساب الأدمن بنجاح');
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            ApiResponse::error('فشل إنشاء المنشأة: ' . $e->getMessage(), 500);
        }
    }

    public function updateTenantStatus($tenantId, $input) {
        try {
            $status = $input['status'] ?? 'active';
            $stmt = $this->db->prepare("UPDATE tenants SET status = :s WHERE tenant_id = :t");
            $stmt->execute(['s' => $status, 't' => $tenantId]);
            ApiResponse::send(['tenant_id' => $tenantId, 'status' => $status], 'تم تحديث حالة المنشأة بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل تحديث حالة المنشأة: ' . $e->getMessage(), 500);
        }
    }

    public function getSubscriptionPlans() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM subscription_plans WHERE is_active = 1 ORDER BY id ASC");
            $stmt->execute();
            $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            ApiResponse::send($plans, 'تم استرجاع خطط الاشتراكات المتاحة بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب الخطط: ' . $e->getMessage(), 500);
        }
    }
}
