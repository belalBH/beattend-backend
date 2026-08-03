export function detectSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  const parts = host.split('.');
  
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'staging') {
    return parts[0];
  }
  
  // Check URL search param e.g. ?tenant=hadiyah or ?company=ALFANAR
  const params = new URLSearchParams(window.location.search);
  const paramTenant = params.get('tenant') || params.get('company') || params.get('subdomain');
  if (paramTenant) return paramTenant;

  return null;
}

export function getActiveTenantId(): string {
  const detected = detectSubdomain();
  if (detected) {
    return `tenant-${detected.toLowerCase()}-102`;
  }
  return localStorage.getItem('beattend_tenant_id') || 'tenant-sol-102';
}
