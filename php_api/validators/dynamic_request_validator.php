<?php
/**
 * Dynamic Request Validator Class
 */
class DynamicRequestValidator {
    public static function validateSubmission($db, $input, $tenantId) {
        $employeeId = $input['employeeId'] ?? null;
        $requestTypeId = $input['requestTypeId'] ?? null;
        $fieldValues = $input['fieldValues'] ?? [];

        if (!$employeeId || !$requestTypeId) {
            throw new Exception("البيانات المطلوبة لتقديم الطلب غير مكتملة.", 400);
        }

        // 1. Verify tenant scope and type status
        $stmt = $db->prepare("
            SELECT * FROM request_types 
            WHERE requestTypeId = :id AND tenantId = :tenant AND isActive = 1 AND deletedAt IS NULL 
            LIMIT 1
        ");
        $stmt->execute(['id' => $requestTypeId, 'tenant' => $tenantId]);
        $type = $stmt->fetch();
        if (!$type) {
            throw new Exception("نوع الطلب المطلوب غير نشط أو غير موجود للمستأجر الحالي.", 400);
        }

        // 2. Fetch expected field templates and validate required fields
        $stmt = $db->prepare("SELECT * FROM request_fields WHERE requestTypeId = :typeId AND deletedAt IS NULL");
        $stmt->execute(['typeId' => $requestTypeId]);
        $fields = $stmt->fetchAll();

        foreach ($fields as $field) {
            $key = $field['fieldKey'];
            $value = $fieldValues[$key] ?? null;

            if ($field['isRequired'] && ($value === null || $value === '')) {
                throw new Exception("الحقل '{$field['nameAr']}' مطلوب للتقديم.", 400);
            }
        }

        return ['requestType' => $type, 'fields' => $fields];
    }
}
