<?php
/**
 * Geofence Controller - Full REST CRUD, Employee Linking & Radius Test Engine
 */
class GeofenceController {
    private $db;

    public function __construct($dbConnection = null) {
        $this->db = $dbConnection ?: Database::getInstance()->getConnection();
    }

    public function getGeofences($tenantId) {
        try {
            $stmt = $this->db->prepare("
                SELECT g.*, c.name_ar AS company_name,
                       (SELECT COUNT(*) FROM geofence_employees ge WHERE ge.geofence_id = g.id) AS assigned_employees_count
                FROM geofences g
                LEFT JOIN companies c ON g.company_id = c.id
                WHERE g.tenant_id = :tenant_id
                ORDER BY g.id ASC
            ");
            $stmt->execute(['tenant_id' => $tenantId]);
            $list = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($list as &$item) {
                $item['latitude'] = (float)$item['latitude'];
                $item['longitude'] = (float)$item['longitude'];
                $item['radius_meters'] = (int)$item['radius_meters'];
                $item['is_active'] = (bool)$item['is_active'];
                $item['linked_employees_count'] = max((int)$item['assigned_employees_count'], (int)$item['linked_employees_count']);
            }

            ApiResponse::send($list, 'تم استرجاع قائمة المواقع الجغرافية بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب المواقع الجغرافية: ' . $e->getMessage(), 500);
        }
    }

    public function getGeofenceById($id, $tenantId) {
        try {
            $stmt = $this->db->prepare("
                SELECT g.*, c.name_ar AS company_name 
                FROM geofences g
                LEFT JOIN companies c ON g.company_id = c.id
                WHERE g.id = :id AND g.tenant_id = :tenant_id
            ");
            $stmt->execute(['id' => (int)$id, 'tenant_id' => $tenantId]);
            $geo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$geo) {
                ApiResponse::error('الموقع الجغرافي المطلوب غير موجود', 404);
                return;
            }

            $geo['latitude'] = (float)$geo['latitude'];
            $geo['longitude'] = (float)$geo['longitude'];
            $geo['radius_meters'] = (int)$geo['radius_meters'];
            $geo['is_active'] = (bool)$geo['is_active'];

            // Fetch linked employee IDs
            $empStmt = $this->db->prepare("SELECT employee_id FROM geofence_employees WHERE geofence_id = :id");
            $empStmt->execute(['id' => (int)$id]);
            $geo['linked_employee_ids'] = $empStmt->fetchAll(PDO::FETCH_COLUMN);

            ApiResponse::send($geo, 'تم استرجاع تفاصيل الموقع بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('خطأ أثناء جلب تفاصيل الموقع: ' . $e->getMessage(), 500);
        }
    }

    public function createGeofence($input, $tenantId) {
        try {
            if (empty($input['name_ar']) || !isset($input['latitude']) || !isset($input['longitude'])) {
                ApiResponse::error('اسم الموقع، خط العرض، وخط الطول حقول إجبارية', 400);
                return;
            }

            $stmt = $this->db->prepare("
                INSERT INTO geofences (tenant_id, company_id, branch_id, name_ar, name_en, latitude, longitude, radius_meters, linked_shift_name, is_active, created_at)
                VALUES (:t, :c, :b, :name_ar, :name_en, :lat, :lng, :radius, :shift, :active, NOW())
            ");
            $stmt->execute([
                't' => $tenantId,
                'c' => isset($input['company_id']) ? (int)$input['company_id'] : 1,
                'b' => isset($input['branch_id']) ? (int)$input['branch_id'] : 1,
                'name_ar' => trim($input['name_ar']),
                'name_en' => trim($input['name_en'] ?? $input['name_ar']),
                'lat' => (float)$input['latitude'],
                'lng' => (float)$input['longitude'],
                'radius' => isset($input['radius_meters']) ? (int)$input['radius_meters'] : 150,
                'shift' => trim($input['linked_shift_name'] ?? 'الشفت الصباحي الأساسي'),
                'active' => isset($input['is_active']) ? ((bool)$input['is_active'] ? 1 : 0) : 1
            ]);

            $newId = (int)$this->db->lastInsertId();
            $this->getGeofenceById($newId, $tenantId);
        } catch (Exception $e) {
            ApiResponse::error('فشل إضافة الموقع الجغرافي: ' . $e->getMessage(), 500);
        }
    }

    public function updateGeofence($id, $input, $tenantId) {
        try {
            $stmtCheck = $this->db->prepare("SELECT id FROM geofences WHERE id = :id AND tenant_id = :t");
            $stmtCheck->execute(['id' => $id, 't' => $tenantId]);
            if (!$stmtCheck->fetch()) {
                ApiResponse::error('الموقع الجغرافي غير موجود', 404);
                return;
            }

            $fields = [];
            $params = ['id' => $id, 't' => $tenantId];

            if (isset($input['name_ar'])) { $fields[] = "name_ar = :name_ar"; $params['name_ar'] = trim($input['name_ar']); }
            if (isset($input['name_en'])) { $fields[] = "name_en = :name_en"; $params['name_en'] = trim($input['name_en']); }
            if (isset($input['latitude'])) { $fields[] = "latitude = :latitude"; $params['latitude'] = (float)$input['latitude']; }
            if (isset($input['longitude'])) { $fields[] = "longitude = :longitude"; $params['longitude'] = (float)$input['longitude']; }
            if (isset($input['radius_meters'])) { $fields[] = "radius_meters = :radius_meters"; $params['radius_meters'] = (int)$input['radius_meters']; }
            if (isset($input['company_id'])) { $fields[] = "company_id = :company_id"; $params['company_id'] = (int)$input['company_id']; }
            if (isset($input['branch_id'])) { $fields[] = "branch_id = :branch_id"; $params['branch_id'] = (int)$input['branch_id']; }
            if (isset($input['linked_shift_name'])) { $fields[] = "linked_shift_name = :linked_shift_name"; $params['linked_shift_name'] = trim($input['linked_shift_name']); }
            if (isset($input['is_active'])) { $fields[] = "is_active = :is_active"; $params['is_active'] = (bool)$input['is_active'] ? 1 : 0; }

            if (!empty($fields)) {
                $sql = "UPDATE geofences SET " . implode(', ', $fields) . " WHERE id = :id AND tenant_id = :t";
                $stmt = $this->db->prepare($sql);
                $stmt->execute($params);
            }

            $this->getGeofenceById($id, $tenantId);
        } catch (Exception $e) {
            ApiResponse::error('فشل تعديل الموقع الجغرافي: ' . $e->getMessage(), 500);
        }
    }

    public function deleteGeofence($id, $tenantId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM geofences WHERE id = :id AND tenant_id = :t");
            $stmt->execute(['id' => $id, 't' => $tenantId]);
            ApiResponse::send(['id' => $id], 'تم حذف الموقع الجغرافي بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل حذف الموقع: ' . $e->getMessage(), 500);
        }
    }

    public function linkEmployees($id, $input, $tenantId) {
        try {
            $employeeIds = $input['employee_ids'] ?? [];
            $delStmt = $this->db->prepare("DELETE FROM geofence_employees WHERE geofence_id = :id");
            $delStmt->execute(['id' => $id]);

            $insStmt = $this->db->prepare("INSERT INTO geofence_employees (geofence_id, employee_id) VALUES (:g, :e)");
            foreach ($employeeIds as $empId) {
                $insStmt->execute(['g' => $id, 'e' => (int)$empId]);
            }

            $count = count($employeeIds);
            $upStmt = $this->db->prepare("UPDATE geofences SET linked_employees_count = :cnt WHERE id = :id");
            $upStmt->execute(['cnt' => $count, 'id' => $id]);

            ApiResponse::send(['geofence_id' => $id, 'linked_count' => $count], 'تم ربط الموظفين بالموقع بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل ربط الموظفين بالموقع: ' . $e->getMessage(), 500);
        }
    }

    public function testRadius($input) {
        try {
            $userLat = (float)($input['user_latitude'] ?? $input['latitude'] ?? 0);
            $userLng = (float)($input['user_longitude'] ?? $input['longitude'] ?? 0);
            $targetLat = (float)($input['target_latitude'] ?? 24.6877);
            $targetLng = (float)($input['target_longitude'] ?? 46.7219);
            $allowedRadius = (int)($input['radius_meters'] ?? 150);

            // Haversine formula calculation in meters
            $earthRadius = 6371000;
            $dLat = deg2rad($targetLat - $userLat);
            $dLng = deg2rad($targetLng - $userLng);
            $a = sin($dLat / 2) * sin($dLat / 2) +
                 cos(deg2rad($userLat)) * cos(deg2rad($targetLat)) *
                 sin($dLng / 2) * sin($dLng / 2);
            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
            $calculatedDistance = round($earthRadius * $c, 2);

            $isWithin = $calculatedDistance <= $allowedRadius;

            ApiResponse::send([
                'user_latitude' => $userLat,
                'user_longitude' => $userLng,
                'target_latitude' => $targetLat,
                'target_longitude' => $targetLng,
                'allowed_radius_meters' => $allowedRadius,
                'calculated_distance_meters' => $calculatedDistance,
                'is_within_geofence' => $isWithin,
                'status_ar' => $isWithin ? 'داخل النطاق الجغرافي المسموح (صحيحة)' : "خارج النطاق الجغرافي (تجاوز بمقدار " . round($calculatedDistance - $allowedRadius, 1) . " متر)"
            ], 'تم اختبار الإحداثيات والنطاق الجغرافي بنجاح');
        } catch (Exception $e) {
            ApiResponse::error('فشل اختبار النطاق الجغرافي: ' . $e->getMessage(), 500);
        }
    }
}
