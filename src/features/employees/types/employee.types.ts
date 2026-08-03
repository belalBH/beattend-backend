export interface DocumentItem {
  id: string;
  type: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuer?: string;
  file_url?: string;
}

export interface EmployeeProfileFull {
  id: number;
  empNo: string;
  first_name: string;
  last_name: string;
  name_ar?: string;
  name_en?: string;
  email: string;
  phone?: string;
  secondary_phone?: string;
  national_id?: string;
  iqama_expiry_date?: string;
  gender?: 'male' | 'female';
  dob?: string;
  marital_status?: string;
  nationality?: string;
  avatar_url?: string;
  national_address?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  status: 'active' | 'inactive' | 'suspended' | 'resigned' | 'terminated';
  is_active?: boolean;

  // Job Details
  company_id?: number;
  company_name?: string;
  branch_id?: number;
  branch_name?: string;
  administration?: string;
  department_id?: number;
  department_name?: string;
  job_title_id?: number;
  job_title?: string;
  job_grade?: string;
  manager_id?: number;
  manager_name?: string;
  hire_date?: string;
  join_date?: string;
  contract_type?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  probation_period?: string;
  duty_type?: string;
  shift_id?: number;
  shift_name?: string;
  schedule_id?: number;
  schedule_name?: string;
  work_hours?: number;
  cost_center?: string;
  project_name?: string;
  work_location_type?: string;

  // Emergency Details
  emergency_name?: string;
  emergency_relationship?: string;
  emergency_phone?: string;
  emergency_secondary_phone?: string;
  emergency_email?: string;
  emergency_address?: string;
  emergency_notes?: string;

  // Documents
  documents?: DocumentItem[];

  // System Accounts
  username?: string;
  login_email?: string;
  role_id?: number;
  role_name?: string;
  account_enabled?: boolean;
  firebase_uid?: string;
  last_login?: string;
  registered_devices_count?: number;

  // Geofence Location
  allowed_branch_id?: number;
  work_location?: string;
  latitude?: number;
  longitude?: number;
  attendance_radius?: number;
  linked_shift_name?: string;
  allow_multiple_locations?: boolean;
  allow_remote_work?: boolean;

  // Bank & Salary
  bank_name?: string;
  account_holder?: string;
  iban?: string;
  account_number?: string;
  account_type?: string;
  bank_code?: string;
  salary_currency?: string;
  payment_method?: string;
  iban_verified?: boolean;

  // Additional Information
  qualification?: string;
  specialization?: string;
  university?: string;
  graduation_year?: string;
  experience_years?: string;
  languages?: string;
  skills?: string;
  medical_insurance_no?: string;
  gosi_number?: string;
  gosi_deduction_rate?: number;
  mudad_id?: string;
  odoo_id?: string;
  internal_notes?: string;
  tags?: string[];
}

export interface DropdownOptionsFull {
  companies: Array<{ id: number; name_ar: string }>;
  branches: Array<{ id: number; name_ar: string }>;
  departments: Array<{ id: number; name_ar: string }>;
  jobTitles: Array<{ id: number; name_ar: string }>;
  managers: Array<{ id: number; name_ar: string }>;
  shifts: Array<{ id: number; name_ar: string }>;
  locations: Array<{ id: number; name_ar: string }>;
  roles: Array<{ id: number; name_ar: string }>;
  banks: Array<{ id: string; name_ar: string }>;
  nationalities: Array<{ id: string; name_ar: string }>;
}
