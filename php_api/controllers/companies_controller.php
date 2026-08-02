<?php
/**
 * Companies Controller
 */
class CompaniesController {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    private function normalizeDomain($domain) {
        $clean = trim((string)$domain);
        $clean = strtolower($clean);
        $clean = preg_replace('/^https?:\/\//i', '', $clean);
        $clean = preg_replace('/\/.*$/', '', $clean);
        return trim($clean);
    }

    public function validate($domain) {
        try {
            $rawInput = trim((string)$domain);
            $normalized = $this->normalizeDomain($rawInput);
            $normalizedNoWww = preg_replace('/^www\./i', '', $normalized);

            if (empty($normalized)) {
                ApiResponse::error('يرجى إدخال نطاق شركة أو معرف مساحة عمل صحيح.', 400);
                return;
            }

            // Strictly validate workspace by exact verified company_domain, company_domain_aliases, or tenant_slug ONLY.
            // Never search by internal tenant_id or company display name.
            $stmt = $this->db->prepare("
                SELECT c.*, 
                       COALESCE(c.company_domain, c.tenant_slug) as public_domain
                FROM companies c
                LEFT JOIN company_domain_aliases cda ON c.id = cda.company_id
                WHERE (LOWER(c.company_domain) = :domain OR LOWER(c.company_domain) = :domainNoWww)
                   OR (LOWER(c.tenant_slug) = :slug)
                   OR (cda.normalized_domain IN (:domain, :domainNoWww) AND cda.is_active = 1)
                LIMIT 1
            ");
            $stmt->execute([
                'domain' => $normalized,
                'domainNoWww' => $normalizedNoWww,
                'slug' => $normalized
            ]);
            $company = $stmt->fetch();

            if (!$company) {
                ApiResponse::error('الشركة غير مسجلة أو النطاق غير صحيح.', 404);
                return;
            }

            if (($company['status'] ?? 'active') !== 'active') {
                ApiResponse::error('مساحة العمل هذه معطلة حالياً. يرجى التواصل مع مسؤول النظام.', 403);
                return;
            }

            $tenantConfig = require __DIR__ . '/../config/tenant_config.php';
            $features = $tenantConfig['features'] ?? [];
            
            ApiResponse::success([
                'companyId' => (int)$company['id'],
                'tenantId' => $company['tenant_id'], // Internal tenant ID returned to app after validation
                'tenantSlug' => $company['tenant_slug'] ?? '',
                'companyName' => $company['name'],
                'companyDomain' => $company['company_domain'] ?? $company['tenant_slug'],
                'companyStatus' => $company['status'],
                'logoUrl' => $company['logo'] ?? '',
                'minimumAppVersion' => $company['minimum_app_version'] ?? '1.0.0',
                'featureFlags' => $features
            ], 'تم التحقق من نطاق الشركة بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل في معالجة طلب النطاق.', 500);
        }
    }

    public function getCompanies() {
        try {
            $stmt = $this->db->prepare("SELECT id, tenant_id, tenant_slug, company_domain, name, logo, status FROM companies WHERE status = 'active'");
            $stmt->execute();
            ApiResponse::success($stmt->fetchAll(), 'قائمة الشركات المتاحة');
        } catch (Exception $e) {
            ApiResponse::error($e->getMessage(), 500);
        }
    }
}
