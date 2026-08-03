declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

export const API_CONFIG = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api',
  PHP_API_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PHP_API_URL) || '/php_api/api.php',
  DEFAULT_TENANT_ID: 'tenant-sol-102',
};
