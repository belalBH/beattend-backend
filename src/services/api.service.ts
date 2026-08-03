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
  // 1. Companies CRUD
  async getCompanies(): Promise<Company[]> {
    return await fetchApi<Company[]>(`${API_CONFIG.PHP_API_URL}?route=companies`);
  },

  async createCompany(companyData: Partial<Company>): Promise<Company> {
    return await fetchApi<Company>(`${API_CONFIG.PHP_API_URL}?route=companies`, {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  },

  async updateCompany(id: number, companyData: Partial<Company>): Promise<Company> {
    return await fetchApi<Company>(`${API_CONFIG.PHP_API_URL}?route=companies&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData)
    });
  },

  async deleteCompany(id: number): Promise<void> {
    await fetchApi(`${API_CONFIG.PHP_API_URL}?route=companies&id=${id}`, {
      method: 'DELETE'
    });
  },

  // 2. Employees CRUD
  async getEmployees(companyId?: number): Promise<Employee[]> {
    const url = companyId ? `${API_CONFIG.PHP_API_URL}?route=employees&companyId=${companyId}` : `${API_CONFIG.PHP_API_URL}?route=employees`;
    return await fetchApi<Employee[]>(url);
  },

  async createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    return await fetchApi<Employee>(`${API_CONFIG.PHP_API_URL}?route=employees`, {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  },

  async updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee> {
    return await fetchApi<Employee>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData)
    });
  },

  async deleteEmployee(id: number): Promise<void> {
    await fetchApi(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`, {
      method: 'DELETE'
    });
  },

  // 3. Attendance CRUD & Correction
  async getAttendance(): Promise<AttendanceRecord[]> {
    return await fetchApi<AttendanceRecord[]>(`${API_CONFIG.PHP_API_URL}?route=attendance`);
  },

  async checkIn(location?: string): Promise<AttendanceRecord> {
    return await fetchApi<AttendanceRecord>(`${API_CONFIG.PHP_API_URL}?route=attendance`, {
      method: 'POST',
      body: JSON.stringify({ location: location || 'Staging Branch', check_in: new Date().toISOString() })
    });
  },

  async correctAttendance(id: number, status: string): Promise<AttendanceRecord> {
    return await fetchApi<AttendanceRecord>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=correct&id=${id}`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },

  // 4. Leave Requests Workflow
  async getLeaves(): Promise<LeaveRequest[]> {
    return await fetchApi<LeaveRequest[]>(`${API_CONFIG.PHP_API_URL}?route=leaves`);
  },

  async createLeave(leaveData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return await fetchApi<LeaveRequest>(`${API_CONFIG.PHP_API_URL}?route=leaves`, {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  },

  async approveLeave(id: number): Promise<LeaveRequest> {
    return await fetchApi<LeaveRequest>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=approve&id=${id}`, {
      method: 'POST'
    });
  },

  async rejectLeave(id: number, reason: string): Promise<LeaveRequest> {
    return await fetchApi<LeaveRequest>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=reject&id=${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async cancelLeave(id: number): Promise<LeaveRequest> {
    return await fetchApi<LeaveRequest>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=cancel&id=${id}`, {
      method: 'POST'
    });
  }
};
