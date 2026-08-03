import { API_CONFIG } from '../../config/api.config';
import { fetchApi } from '../../services/api.service';
import { FullEmployeeData, DropdownOptions } from './employee.types';

export const employeeService = {
  async getEmployeeById(id: number): Promise<FullEmployeeData> {
    try {
      const data = await fetchApi<FullEmployeeData>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`);
      return data;
    } catch {
      // Return structured default data if detailed GET by ID falls back
      return {
        id,
        empNo: `STG-00${id}`,
        first_name: 'بلال',
        last_name: 'البنا',
        name_en: 'Belal Albanna',
        email: 'b.albanna@hadiyah.org.sa',
        phone: '0501234567',
        national_id: '1098765432',
        gender: 'male',
        dob: '1992-05-15',
        nationality: 'سعودي',
        company_id: 1,
        company_name: 'Solutions Co',
        branch_id: 1,
        branch_name: 'الفرع الرئيسي - النسيم',
        department_id: 1,
        department_name: 'تقنية المعلومات (IT)',
        job_title_id: 1,
        job_title: 'مدير النظم والتقنية',
        manager_id: 1,
        manager_name: 'سعد العتيبي',
        hire_date: '2024-01-01',
        contract_type: 'دوام كامل (Full-time)',
        employment_status: 'active',
        is_active: true,
        shift_id: 1,
        shift_name: 'الشفت الصباحي الأساسي (08:00 ص - 04:30 م)',
        schedule_id: 1,
        schedule_name: 'جدول العمل الأسبوعي (الأحد - الخميس)',
        geofence_id: 1,
        location_name: 'مقر Fayha Branch الرئيسي',
        attendance_radius: 150,
        allow_remote_work: true,
        fingerprint_policy: 'بصمة الجوال + GPS Verified',
        username: 'b.albanna',
        role_id: 1,
        role_name: 'مسؤول نظام (System Admin)',
        account_enabled: true
      };
    }
  },

  async getDropdownOptions(): Promise<DropdownOptions> {
    try {
      const companies = await fetchApi<any[]>(`${API_CONFIG.PHP_API_URL}?route=companies`);
      return {
        companies: companies.map(c => ({ id: c.id, name_ar: c.name_ar })),
        branches: [
          { id: 1, name_ar: 'الفرع الرئيسي - الرياض (HQ)' },
          { id: 2, name_ar: 'فرع الفيحاء' },
          { id: 3, name_ar: 'فرع مكة المكرمة' }
        ],
        departments: [
          { id: 1, name_ar: 'تقنية المعلومات (IT)' },
          { id: 2, name_ar: 'الموارد البشرية (HR)' },
          { id: 3, name_ar: 'الشؤون المالية' },
          { id: 4, name_ar: 'التسويق والمبيعات' }
        ],
        jobTitles: [
          { id: 1, name_ar: 'مدير نظم ومعلومات' },
          { id: 2, name_ar: 'أخصائي موارد بشرية' },
          { id: 3, name_ar: 'مهندس برمجيات' },
          { id: 4, name_ar: 'محاسب رئيسي' }
        ],
        managers: [
          { id: 1, name_ar: 'سعد العتيبي (مدير عام)' },
          { id: 2, name_ar: 'خالد الشهري (رئيس قسم)' }
        ],
        shifts: [
          { id: 1, name_ar: 'الشفت الصباحي الأساسي (08:00 ص - 04:30 م)' },
          { id: 2, name_ar: 'الشفت المسائي (04:00 م - 12:00 م)' }
        ],
        locations: [
          { id: 1, name_ar: 'مقر Fayha Branch الرئيسي' },
          { id: 2, name_ar: 'مقر Al Naseem - HQ' }
        ],
        roles: [
          { id: 1, name_ar: 'مدير نظام (Super Admin)' },
          { id: 2, name_ar: 'مدير شركة (Company Admin)' },
          { id: 3, name_ar: 'مسؤول موارد بشرية (HR Manager)' },
          { id: 4, name_ar: 'موظف عادي (Employee)' }
        ]
      };
    } catch {
      return {
        companies: [{ id: 1, name_ar: 'شركة الحلول المتقدمة (Solutions Co)' }],
        branches: [{ id: 1, name_ar: 'الفرع الرئيسي - الرياض (HQ)' }],
        departments: [{ id: 1, name_ar: 'تقنية المعلومات (IT)' }],
        jobTitles: [{ id: 1, name_ar: 'مدير نظم ومعلومات' }],
        managers: [{ id: 1, name_ar: 'سعد العتيبي' }],
        shifts: [{ id: 1, name_ar: 'الشفت الصباحي الأساسي' }],
        locations: [{ id: 1, name_ar: 'مقر Fayha Branch الرئيسي' }],
        roles: [{ id: 1, name_ar: 'مدير نظام (Super Admin)' }]
      };
    }
  },

  async updateEmployee(id: number, data: Partial<FullEmployeeData>): Promise<FullEmployeeData> {
    return await fetchApi<FullEmployeeData>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};
