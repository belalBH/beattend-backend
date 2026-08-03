import { API_CONFIG } from '../config/api.config';
import { Company, Employee, AttendanceRecord, LeaveRequest } from '../types';

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Tenant-ID': API_CONFIG.DEFAULT_TENANT_ID,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const result = await response.json();

  if (!response.ok || (result.success !== undefined && !result.success)) {
    throw new Error(result.message || `API Request failed (${response.status})`);
  }

  return result.data !== undefined ? result.data : result;
}

export const apiService = {
  // 1. Companies Module
  async getCompanies(): Promise<Company[]> {
    try {
      return await fetchApi<Company[]>(`${API_CONFIG.PHP_API_URL}?route=companies`);
    } catch {
      // Fallback staging data if backend is offline
      return [
        { id: 1, tenant_id: 'tenant-sol-102', name: 'Solutions Co', name_ar: 'شركة الحلول المتقدمة', cr_number: '10108849', tax_number: '310992', is_active: true, created_at: '2026-08-01' }
      ];
    }
  },

  // 2. Employees Module
  async getEmployees(companyId?: number): Promise<Employee[]> {
    try {
      const url = companyId ? `${API_CONFIG.PHP_API_URL}?route=employees&companyId=${companyId}` : `${API_CONFIG.PHP_API_URL}?route=employees`;
      return await fetchApi<Employee[]>(url);
    } catch {
      return [
        { id: 1, empNo: 'EMP-001', first_name: 'بلال', last_name: 'البنا', email: 'b.albanna@hadiyah.org.sa', company_name: 'جمعية هدية (Hadiyah Association)', department_name: 'تقنية المعلومات (IT)', status: 'active' },
        { id: 2, empNo: 'EMP-101', first_name: 'سعد', last_name: 'العتيبي', email: 'saad@solutions.sa', company_name: 'Solutions Co', department_name: 'تقنية المعلومات (IT)', status: 'active' },
        { id: 3, empNo: 'EMP-102', first_name: 'خالد', last_name: 'الشهري', email: 'k.shehri@solutions.sa', company_name: 'Solutions Co', department_name: 'الموارد البشرية (HR)', status: 'active' }
      ];
    }
  },

  // 3. Attendance Module
  async getAttendance(): Promise<AttendanceRecord[]> {
    try {
      return await fetchApi<AttendanceRecord[]>(`${API_CONFIG.PHP_API_URL}?route=attendance`);
    } catch {
      return [
        { id: 1, employee_name: 'بلال البنا', check_in: '08:00 AM', check_out: '04:30 PM', location: 'Fayha Branch', work_hours: '8.5 س', status: 'حاضر في الموعد' },
        { id: 2, employee_name: 'سعد العتيبي', check_in: '08:15 AM', check_out: '04:30 PM', location: 'Al Naseem - HQ', work_hours: '8.25 س', status: 'متأخر 15 دقيقة' },
        { id: 3, employee_name: 'خالد الشهري', check_in: '-', check_out: '-', location: 'Al Naseem - HQ', work_hours: '0 س', status: 'غائب' }
      ];
    }
  },

  // 4. Leave Requests Module
  async getLeaves(): Promise<LeaveRequest[]> {
    try {
      return await fetchApi<LeaveRequest[]>(`${API_CONFIG.PHP_API_URL}?route=leaves`);
    } catch {
      return [
        { id: 1, employee_name: 'بلال البنا', type: 'إجازة سنوية', start_date: '2026-08-05', end_date: '2026-08-10', days_count: 5, status: 'بانتظار موافقة المدير', reason: 'Annual Leave' },
        { id: 2, employee_name: 'سعد العتيبي', type: 'إجازة مرضية', start_date: '2026-07-20', end_date: '2026-07-21', days_count: 2, status: 'مقبولة', reason: 'Sick Leave' }
      ];
    }
  }
};
