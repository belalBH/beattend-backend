export interface TenantFull {
  tenant_id: string;
  company_code: string;
  slug: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'expired';
  company_name?: string;
  company_name_en?: string;
  cr_number?: string;
  tax_number?: string;
  plan_name?: string;
  max_admin_users: number;
  max_employees: number;
  max_branches: number;
  current_employees_count: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface TenantOnboardInput {
  company_name: string;
  company_code: string;
  admin_email: string;
  plan_id: number;
}
