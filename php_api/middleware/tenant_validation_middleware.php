<?php
/**
 * Tenant Validation Middleware
 */
class TenantValidationMiddleware {
    public static function validate($requestHeaders, $authenticatedUser = null) {
        $tenantId = $requestHeaders['X-Tenant-ID'] ?? $requestHeaders['x-tenant-id'] ?? null;

        if (!$tenantId) {
            ApiResponse::error('معرف المستأجر (X-Tenant-ID) مطلوب في الترويسة.', 400);
        }

        if ($authenticatedUser != null) {
            // Verify token tenant claims match request tenant context
            if ($authenticatedUser['tenant_id'] !== $tenantId) {
                ApiResponse::error('وصول غير مصرح به لمستأجر آخر.', 403);
            }
        }
        
        return $tenantId;
    }
}
