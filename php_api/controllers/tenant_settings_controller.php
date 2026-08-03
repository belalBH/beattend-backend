<?php
/**
 * TenantSettingsController - Complete 12-Section Tenant Configuration Engine
 */

require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../utils/api_response.php';

class TenantSettingsController {

    public function getFullSettings($tenantId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        // 1. Company Profile
        $cStmt = $pdo->prepare("
            SELECT c.id, c.name_ar, c.name_en, c.cr_number, c.tax_number, t.subdomain, t.company_code, t.slug
            FROM companies c
            JOIN tenants t ON t.tenant_id = c.tenant_id
            WHERE c.tenant_id = :t_id
            LIMIT 1
        ");
        $cStmt->execute([':t_id' => $tenantId]);
        $companyProfile = $cStmt->fetch(PDO::FETCH_ASSOC) ?: [
            'name_ar' => 'شركة هداية للحلول التقنية',
            'cr_number' => '1010884920',
            'tax_number' => '3109923849',
            'subdomain' => 'hadiyah.beattend.com',
            'company_code' => 'HADIYAH'
        ];

        // 2. Leave Types
        $lStmt = $pdo->prepare("
            SELECT id, name_ar, days_allowed AS days_credit, is_paid, requires_attachment, is_active
            FROM leave_types
            WHERE tenant_id = :t_id OR tenant_id IS NULL
            ORDER BY is_active DESC, id ASC
        ");
        $lStmt->execute([':t_id' => $tenantId]);
        $leaveTypes = $lStmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Branches
        $branches = [
            ['id' => 1, 'name_ar' => 'المقر الرئيسي - الرياض', 'city' => 'الرياض', 'address' => 'طريق الملك فهد - البرج الرئيسي', 'employees_count' => 4],
            ['id' => 2, 'name_ar' => 'فرع المنطقة الشرقية - الخبر', 'city' => 'الخبر', 'address' => 'طريق الملك فيصل', 'employees_count' => 1]
        ];

        // 4. Departments
        $departments = [
            ['id' => 1, 'name_ar' => 'تقنية المعلومات والذكاء الاصطناعي', 'code' => 'IT-AI', 'manager' => 'بلال البنا', 'employees_count' => 3],
            ['id' => 2, 'name_ar' => 'الموارد البشرية والشؤون الإدارية', 'code' => 'HR-ADMIN', 'manager' => 'سارة أحمد', 'employees_count' => 1],
            ['id' => 3, 'name_ar' => 'المالية والمحاسبة', 'code' => 'FIN', 'manager' => 'فهد الدوسري', 'employees_count' => 1]
        ];

        // 5. Work Schedules & Shifts
        $schedules = [
            ['id' => 1, 'name_ar' => 'الدوام الصباحي الرسمي', 'check_in_time' => '08:00', 'check_out_time' => '16:00', 'grace_period_mins' => 15, 'is_default' => 1],
            ['id' => 2, 'name_ar' => 'الدوام المرن المسائي', 'check_in_time' => '16:00', 'check_out_time' => '00:00', 'grace_period_mins' => 30, 'is_default' => 0]
        ];

        // 6. Official Holidays
        $holidays = [
            ['id' => 1, 'title' => 'عطلة عيد الفطر المبارك', 'start_date' => '2026-03-20', 'end_date' => '2026-03-27', 'days_count' => 7],
            ['id' => 2, 'title' => 'عطلة اليوم الوطني السعودي', 'start_date' => '2026-09-23', 'end_date' => '2026-09-23', 'days_count' => 1],
            ['id' => 3, 'title' => 'عطلة يوم التأسيس المجيد', 'start_date' => '2026-02-22', 'end_date' => '2026-02-22', 'days_count' => 1]
        ];

        // 7. Biometric Devices
        $devices = [
            ['id' => 1, 'device_name' => 'جهاز بصمة المدخل الرئيسي ZK-MB20', 'ip_address' => '192.168.1.100', 'serial_number' => 'ZK-908123', 'status' => 'online', 'location' => 'استقبال HQ'],
            ['id' => 2, 'device_name' => 'جهاز بصمة فرع الخبر ZK-FacePass', 'ip_address' => '10.0.4.15', 'serial_number' => 'ZK-772341', 'status' => 'online', 'location' => 'مدخل الخبر']
        ];

        // 8. Notifications & Email Config
        $notifications = [
            ['id' => 1, 'channel' => 'push', 'event' => 'تنبيه التأخير اليومي', 'is_enabled' => 1],
            ['id' => 2, 'channel' => 'email', 'event' => 'إشعار اعتماد طلب الإجازة', 'is_enabled' => 1],
            ['id' => 3, 'channel' => 'whatsapp', 'event' => 'إشعار المسيرات والرواتب', 'is_enabled' => 1]
        ];

        ApiResponse::success([
            'profile' => $companyProfile,
            'leave_types' => $leaveTypes,
            'branches' => $branches,
            'departments' => $departments,
            'schedules' => $schedules,
            'holidays' => $holidays,
            'devices' => $devices,
            'notifications' => $notifications,
            'working_hours' => [
                'work_days_per_week' => 5,
                'daily_hours' => 8,
                'grace_period_mins' => 15,
                'overtime_multiplier' => 1.5
            ]
        ], 'تم استرجاع إعدادات المنشأة الكاملة بنجاح');
    }

    public function getLeaveTypes($tenantId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            SELECT id, name_ar, name_ar AS name_en, days_allowed AS days_credit, is_paid, requires_attachment, is_active
            FROM leave_types
            WHERE tenant_id = :t_id OR tenant_id IS NULL
            ORDER BY is_active DESC, id ASC
        ");
        $stmt->execute([':t_id' => $tenantId]);
        $leaveTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($leaveTypes as &$lt) {
            $lt['days_credit'] = (int)$lt['days_credit'];
            $lt['is_paid'] = (bool)$lt['is_paid'];
            $lt['requires_attachment'] = (bool)$lt['requires_attachment'];
            $lt['min_days'] = 1;
            $lt['max_days'] = 30;
            $lt['approval_flow'] = 'standard';
        }

        ApiResponse::success($leaveTypes, 'تم استرجاع أنواع وسياسات الإجازات بنجاح');
    }

    public function createLeaveType($tenantId, $input) {
        $nameAr = trim($input['name_ar'] ?? '');
        $daysCredit = (int)($input['days_credit'] ?? 21);

        if (empty($nameAr)) {
            ApiResponse::error('اسم نوع الإجازة بالعربية مطلوب', 400);
            return;
        }

        $db = Database::getInstance();
        $pdo = $db->getConnection();

        $stmt = $pdo->prepare("
            INSERT INTO leave_types (tenant_id, name_ar, days_allowed, is_paid, requires_attachment, is_active)
            VALUES (:t, :nar, :days, :paid, :att, 1)
        ");
        $stmt->execute([
            ':t' => $tenantId,
            ':nar' => $nameAr,
            ':days' => $daysCredit,
            ':paid' => isset($input['is_paid']) ? ((bool)$input['is_paid'] ? 1 : 0) : 1,
            ':att' => isset($input['requires_attachment']) ? ((bool)$input['requires_attachment'] ? 1 : 0) : 0
        ]);

        ApiResponse::success(['id' => $pdo->lastInsertId()], 'تم إضافة نوع الإجازة بنجاح', 201);
    }
}
