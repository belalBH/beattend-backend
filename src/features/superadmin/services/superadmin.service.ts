import { API_CONFIG } from '../../../config/api.config';
import { fetchApi } from '../../../services/api.service';
import { TenantFull, TenantOnboardInput } from '../types/superadmin.types';

export const superAdminService = {
  async getTenants(): Promise<TenantFull[]> {
    return await fetchApi<TenantFull[]>(`${API_CONFIG.PHP_API_URL}?route=platform_tenants`, {
      headers: {
        'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
      }
    });
  },

  async onboardTenant(data: TenantOnboardInput): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=platform_tenants`, {
      method: 'POST',
      headers: {
        'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
      },
      body: JSON.stringify(data)
    });
  },

  async updateTenantStatus(tenantId: string, status: 'active' | 'suspended' | 'expired'): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=superadmin&action=tenants&tenant_id=${tenantId}`, {
      method: 'PUT',
      headers: {
        'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
      },
      body: JSON.stringify({ status })
    });
  },

  async resolveTenant(identifier: string): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=tenant&identifier=${encodeURIComponent(identifier)}`);
  }
};
