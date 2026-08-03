<?php
/**
 * Companies Controller - Complete CRUD Operations
 */
class CompaniesController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function getCompanies($tenantId) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, tenant_id, name, name_ar, cr_number, tax_number, is_active, created_at 
                FROM companies 
                WHERE tenant_id = :tenant_id 
                ORDER BY id DESC
            ");
            $stmt->execute(['tenant_id' => $tenantId]);
            $companies = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Cast boolean for clean JSON response
            foreach ($companies as &$company) {
                $company['is_active'] = (bool)$company['is_active'];
            }

            ApiResponse::send($companies, 'تم استرجاع قائمة الشركات بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب الشركات: ' . $e->getMessage(), 500);
        }
    }

    public function createCompany($input, $tenantId) {
        try {
            if (empty($input['name']) && empty($input['name_ar'])) {
                ApiResponse::error('اسم الشركة باللغة العربية والإنجليزية حقل إجباري', 400);
                return;
            }

            $nameAr = !empty($input['name_ar']) ? trim($input['name_ar']) : trim($input['name']);
            $nameEn = !empty($input['name']) ? trim($input['name']) : $nameAr;
            $crNumber = trim($input['cr_number'] ?? '');
            $taxNumber = trim($input['tax_number'] ?? '');
            $isActive = isset($input['is_active']) ? ((bool)$input['is_active'] ? 1 : 0) : 1;

            $stmt = $this->db->prepare("
                INSERT INTO companies (tenant_id, name, name_ar, cr_number, tax_number, is_active, created_at)
                VALUES (:tenant_id, :name, :name_ar, :cr_number, :tax_number, :is_active, NOW())
            ");
            $stmt->execute([
                'tenant_id' => $tenantId,
                'name' => $nameEn,
                'name_ar' => $nameAr,
                'cr_number' => $crNumber,
                'tax_number' => $taxNumber,
                'is_active' => $isActive
            ]);

            $newId = (int)$this->db->lastInsertId();
            
            $stmtFetch = $this->db->prepare("SELECT * FROM companies WHERE id = :id AND tenant_id = :tenant_id");
            $stmtFetch->execute(['id' => $newId, 'tenant_id' => $tenantId]);
            $createdCompany = $stmtFetch->fetch(PDO::FETCH_ASSOC);
            if ($createdCompany) {
                $createdCompany['is_active'] = (bool)$createdCompany['is_active'];
            }

            ApiResponse::send($createdCompany, 'تم إضافة الشركة بنجاح', 201);
        } catch (Exception $e) {
            ApiResponse::error('فشل إنشاء الشركة: ' . $e->getMessage(), 500);
        }
    }

    public function updateCompany($id, $input, $tenantId) {
        try {
            $stmtCheck = $this->db->prepare("SELECT id FROM companies WHERE id = :id AND tenant_id = :tenant_id");
            $stmtCheck->execute(['id' => $id, 'tenant_id' => $tenantId]);
            if (!$stmtCheck->fetch()) {
                ApiResponse::error('الشركة غير موجودة أو غير مصرح بتعديلها', 404);
                return;
            }

            $fields = [];
            $params = ['id' => $id, 'tenant_id' => $tenantId];

            if (isset($input['name'])) {
                $fields[] = 'name = :name';
                $params['name'] = trim($input['name']);
            }
            if (isset($input['name_ar'])) {
                $fields[] = 'name_ar = :name_ar';
                $params['name_ar'] = trim($input['name_ar']);
            }
            if (isset($input['cr_number'])) {
                $fields[] = 'cr_number = :cr_number';
                $params['cr_number'] = trim($input['cr_number']);
            }
            if (isset($input['tax_number'])) {
                $fields[] = 'tax_number = :tax_number';
                $params['tax_number'] = trim($input['tax_number']);
            }
            if (isset($input['is_active'])) {
                $fields[] = 'is_active = :is_active';
                $params['is_active'] = (bool)$input['is_active'] ? 1 : 0;
            }

            if (empty($fields)) {
                ApiResponse::error('لا توجد بيانات محدثة لتعديلها', 400);
                return;
            }

            $sql = "UPDATE companies SET " . implode(', ', $fields) . " WHERE id = :id AND tenant_id = :tenant_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $stmtFetch = $this->db->prepare("SELECT * FROM companies WHERE id = :id AND tenant_id = :tenant_id");
            $stmtFetch->execute(['id' => $id, 'tenant_id' => $tenantId]);
            $updatedCompany = $stmtFetch->fetch(PDO::FETCH_ASSOC);
            if ($updatedCompany) {
                $updatedCompany['is_active'] = (bool)$updatedCompany['is_active'];
            }

            ApiResponse::send($updatedCompany, 'تم تحديث بيانات الشركة بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل تحديث بيانات الشركة: ' . $e->getMessage(), 500);
        }
    }

    public function deleteCompany($id, $tenantId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM companies WHERE id = :id AND tenant_id = :tenant_id");
            $stmt->execute(['id' => $id, 'tenant_id' => $tenantId]);

            if ($stmt->rowCount() === 0) {
                ApiResponse::error('الشركة غير موجودة أو سبق حذفها', 404);
                return;
            }

            ApiResponse::send(['id' => (int)$id], 'تم حذف الشركة بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل حذف الشركة: ' . $e->getMessage(), 500);
        }
    }
}
