import { API_CONFIG } from '../config/api.config';
import { Company, Employee, AttendanceRecord, LeaveRequest } from '../types';

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const activeTenantId = localStorage.getItem('beattend_tenant_id') || API_CONFIG.DEFAULT_TENANT_ID;
  const platformToken = localStorage.getItem('beattend_platform_token') || 'PlatformSuperAdminSecret2026!';

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Tenant-ID': activeTenantId,
    'X-Platform-Token': platformToken,
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const rawText = await response.text();

    if (!rawText || rawText.trim().length === 0) {
      if (!response.ok) {
        throw new Error(`تعذر الاتصال بالخادم (رمز الاستجابة: HTTP ${response.status})`);
      }
      return {} as T;
    }

    let result: any;
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error('[API Parse Error] Received non-JSON text:', rawText);
      throw new Error(`استجابة الخادم غير صالحة (HTTP ${response.status})`);
    }

    if (!response.ok || (result && result.success === false)) {
      const errMsg = result?.message || `فشل طلب الـ API (رمز الاستجابة: ${response.status})`;
      throw new Error(errMsg);
    }

    return (result && result.data !== undefined) ? result.data : result;
  } catch (err: any) {
      console.error(`[API Call Failed] URL: ${url}`, err);
      throw err;
  }
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
    return await fetchApi<void>(`${API_CONFIG.PHP_API_URL}?route=companies&id=${id}`, {
      method: 'DELETE'
    });
  },

  // 2. Employees CRUD
  async getEmployees(): Promise<Employee[]> {
    return await fetchApi<Employee[]>(`${API_CONFIG.PHP_API_URL}?route=employees`);
  },

  async getEmployeeById(id: number): Promise<Employee> {
    return await fetchApi<Employee>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`);
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
    return await fetchApi<void>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`, {
      method: 'DELETE'
    });
  },

  // 3. Attendance CRUD
  async checkIn(payload: any): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=checkin`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async checkOut(payload: any): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=checkout`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getAttendanceLogs(): Promise<AttendanceRecord[]> {
    return await fetchApi<AttendanceRecord[]>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=logs`);
  },

  async getAttendanceStats(): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=attendance`);
  },

  // 4. Leaves CRUD
  async getLeaves(): Promise<LeaveRequest[]> {
    return await fetchApi<LeaveRequest[]>(`${API_CONFIG.PHP_API_URL}?route=leaves`);
  },

  async createLeave(payload: any): Promise<LeaveRequest> {
    return await fetchApi<LeaveRequest>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=create`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateLeaveStatus(id: number, action: 'approve' | 'reject'): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=${action}&id=${id}`, {
      method: 'POST'
    });
  },

  async approveLeave(id: number): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=approve&id=${id}`, {
      method: 'POST'
    });
  },

  async rejectLeave(id: number, reason?: string): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=reject&id=${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async cancelLeave(id: number): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=leaves&action=cancel&id=${id}`, {
      method: 'POST'
    });
  }
};
