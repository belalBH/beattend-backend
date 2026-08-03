export interface Company {
  id: number;
  tenant_id: string;
  name: string;
  name_ar: string;
  cr_number?: string;
  tax_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: number;
  empNo: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id?: number;
  company_name?: string;
  department_name?: string;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: number;
  employee_name: string;
  check_in: string;
  check_out?: string;
  location?: string;
  work_hours?: string;
  status: string;
}

export interface LeaveRequest {
  id: number;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  reason?: string;
}
