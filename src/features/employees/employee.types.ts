export interface FullEmployeeData {
  id: number;
  empNo: string;
  first_name: string;
  last_name: string;
  name_en?: string;
  email: string;
  phone?: string;
  national_id?: string;
  gender?: 'male' | 'female';
  dob?: string;
  nationality?: string;
  avatar_url?: string;
  
  // Job Details
  company_id?: number;
  company_name?: string;
  branch_id?: number;
  branch_name?: string;
  department_id?: number;
  department_name?: string;
  job_title_id?: number;
  job_title?: string;
  manager_id?: number;
  manager_name?: string;
  hire_date?: string;
  contract_type?: string;
  employment_status?: 'active' | 'inactive' | 'suspended';
  status?: 'active' | 'inactive';
  is_active?: boolean;

  // Attendance & Shifts
  shift_id?: number;
  shift_name?: string;
  schedule_id?: number;
  schedule_name?: string;
  geofence_id?: number;
  location_name?: string;
  attendance_radius?: number;
  allow_remote_work?: boolean;
  fingerprint_policy?: string;

  // Permissions & System
  username?: string;
  role_id?: number;
  role_name?: string;
  account_enabled?: boolean;
}

export interface DropdownOptions {
  companies: Array<{ id: number; name_ar: string }>;
  branches: Array<{ id: number; name_ar: string }>;
  departments: Array<{ id: number; name_ar: string }>;
  jobTitles: Array<{ id: number; name_ar: string }>;
  managers: Array<{ id: number; name_ar: string }>;
  shifts: Array<{ id: number; name_ar: string }>;
  locations: Array<{ id: number; name_ar: string }>;
  roles: Array<{ id: number; name_ar: string }>;
}
