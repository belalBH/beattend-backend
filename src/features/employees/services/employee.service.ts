import { API_CONFIG } from '../../../config/api.config';
import { fetchApi } from '../../../services/api.service';
import { EmployeeProfileFull, DropdownOptionsFull } from '../types/employee.types';

export function mapEmployeeApiToForm(raw: any): EmployeeProfileFull {
  return {
    id: Number(raw.id),
    empNo: raw.employee_number || raw.empNo || `EMP-STG-${raw.id}`,
    first_name: raw.first_name || '',
    last_name: raw.last_name || '',
    name_ar: raw.arabic_name || raw.name_ar || `${raw.first_name || ''} ${raw.last_name || ''}`,
    name_en: raw.english_name || raw.name_en || `${raw.first_name || ''} ${raw.last_name || ''}`,
    email: raw.email || '',
    phone: raw.phone || '',
    secondary_phone: raw.secondary_phone || '0559876543',
    national_id: raw.identity_number || raw.national_id || '1098765432',
    iqama_expiry_date: raw.iqama_expiry_date || '2028-12-31',
    gender: (raw.gender === 'female') ? 'female' : 'male',
    dob: raw.birth_date || raw.dob || '1992-05-15',
    marital_status: raw.marital_status || 'متزوج',
    nationality: raw.nationality || 'سعودي',
    avatar_url: raw.avatar_url || '',
    national_address: raw.national_address || '7722 حي الفيحاء، طريق صلاح الدين الأيوبي',
    city: raw.city || 'الرياض',
    region: raw.region || 'منطقة الرياض',
    postal_code: raw.postal_code || '12641',
    status: (raw.is_active == 1 || raw.is_active === true) ? 'active' : 'inactive',
    is_active: Boolean(raw.is_active ?? true),

    // Job Details
    company_id: Number(raw.company_id || 1),
    company_name: raw.company_name || 'Solutions Co',
    branch_id: Number(raw.branch_id || 1),
    branch_name: raw.branch_name || 'الفرع الرئيسي - الرياض HQ',
    administration: raw.administration || 'إدارة التقنية والمعلومات',
    department_id: Number(raw.department_id || 1),
    department_name: raw.department_name || 'تقنية المعلومات',
    job_title_id: Number(raw.job_title_id || 1),
    job_title: raw.job_title || 'كبير مهندسي النظم والتقنية',
    job_grade: raw.job_grade || 'Grade-A1 (تنفيذي)',
    manager_id: Number(raw.manager_id || 1),
    manager_name: raw.manager_name || 'سعد العتيبي',
    hire_date: raw.hire_date || '2024-01-01',
    join_date: raw.join_date || '2024-01-01',
    contract_type: raw.contract_type || 'عقد محدد المدة (سنوي)',
    contract_start_date: raw.contract_start_date || '2024-01-01',
    contract_end_date: raw.contract_end_date || '2026-01-01',
    probation_period: raw.probation_period || '90 يوم (منتهية بنجاح)',
    duty_type: raw.duty_type || 'دوام كامل (Full Time)',
    shift_id: Number(raw.shift_id || 1),
    shift_name: raw.shift_name || 'الشفت الصباحي الأساسي',
    schedule_id: Number(raw.schedule_id || 1),
    schedule_name: raw.schedule_name || 'جدول العمل القياسي',
    work_hours: Number(raw.work_hours || 40),
    cost_center: raw.cost_center || 'CC-IT-901',
    project_name: raw.project_name || 'تطوير منصة الحضور والانصراف',
    work_location_type: raw.work_location_type || 'ميداني ومكتبي',

    // Emergency Details
    emergency_name: raw.emergency_name || 'أحمد البنا',
    emergency_relationship: raw.emergency_relationship || 'أخ',
    emergency_phone: raw.emergency_phone || '0509988776',
    emergency_secondary_phone: raw.emergency_secondary_phone || '0112233445',
    emergency_email: raw.emergency_email || 'a.albanna@gmail.com',
    emergency_address: raw.emergency_address || 'الرياض - حي الملز',
    emergency_notes: raw.emergency_notes || 'الاتصال في حالات الطوارئ الطبية أو الإدارية',

    // Documents
    documents: raw.documents || [
      { id: '1', type: 'الهوية الوطنية / الإقامة', document_number: raw.identity_number || '1098765432', issue_date: '2022-01-01', expiry_date: '2027-01-01', issuer: 'الرياض' },
      { id: '2', type: 'جواز السفر', document_number: 'A99882211', issue_date: '2021-05-10', expiry_date: '2026-05-10', issuer: 'جدة' },
      { id: '3', type: 'عقد العمل الموثق (قوى)', document_number: 'CNT-2024-099', issue_date: '2024-01-01', expiry_date: '2026-01-01', issuer: 'منصة قوى' }
    ],

    // System Accounts
    username: raw.username || raw.email?.split('@')[0] || 'b.albanna',
    login_email: raw.email || '',
    role_id: Number(raw.role_id || 1),
    role_name: raw.role_name || 'مسؤول نظام (Super Admin)',
    account_enabled: Boolean(raw.is_active ?? true),
    firebase_uid: raw.firebase_uid || 'FB-STG-990022',
    last_login: raw.last_login || '2026-08-03 09:15:00',
    registered_devices_count: Number(raw.registered_devices_count || 2),

    // Geofence
    allowed_branch_id: Number(raw.branch_id || 1),
    work_location: raw.work_location || 'مقر Fayha Branch الرئيسي',
    latitude: Number(raw.latitude || 24.6877),
    longitude: Number(raw.longitude || 46.7219),
    attendance_radius: Number(raw.attendance_radius || 150),
    linked_shift_name: raw.linked_shift_name || 'الشفت الصباحي الأساسي',
    allow_multiple_locations: Boolean(raw.allow_multiple_locations ?? true),
    allow_remote_work: Boolean(raw.allow_remote_work ?? true),

    // Bank
    bank_name: raw.bank_name || 'البنك الأهلي السعودي (SNB)',
    account_holder: raw.account_holder || `${raw.first_name || ''} ${raw.last_name || ''}`,
    iban: raw.iban || 'SA0310000001234567890123',
    account_number: raw.account_number || '1234567890123',
    account_type: raw.account_type || 'جاري (Current)',
    bank_code: raw.bank_code || 'NCBKSA',
    salary_currency: raw.salary_currency || 'SAR (ريال سعودي)',
    payment_method: raw.payment_method || 'تحويل سريع (حماية الأجور WPS)',
    iban_verified: Boolean(raw.iban_verified ?? true),

    // Additional
    qualification: raw.qualification || 'بكالوريوس علوم الحاسب والمعلومات',
    specialization: raw.specialization || 'هندسة البرمجيات الذكية',
    university: raw.university || 'جامعة الملك سعود',
    graduation_year: raw.graduation_year || '2015',
    experience_years: raw.experience_years || '9 سنوات',
    languages: raw.languages || 'العربية (اللغة الأم)، الإنجليزية (طلاقة)',
    skills: raw.skills || 'TypeScript, React, Node.js, PHP REST API',
    medical_insurance_no: raw.medical_insurance_no || 'INS-BUPA-990022',
    gosi_number: raw.gosi_number || 'GOSI-99881122',
    gosi_deduction_rate: Number(raw.gosi_deduction_rate || 9.75),
    mudad_id: raw.mudad_id || 'MUDAD-EMP-8833',
    odoo_id: raw.odoo_id || 'ODOO-10022',
    internal_notes: raw.internal_notes || 'موظف متميز ومسؤول عن البنية التحتية والأنظمة القيادية',
    tags: raw.tags || ['IT Leadership', 'Full-Stack', 'Core Team']
  };
}

export function mapEmployeeFormToApi(form: Partial<EmployeeProfileFull>): Record<string, any> {
  return {
    employee_number: form.empNo,
    first_name: form.first_name,
    last_name: form.last_name,
    arabic_name: form.name_ar,
    english_name: form.name_en,
    email: form.email,
    phone: form.phone,
    national_id: form.national_id,
    identity_number: form.national_id,
    nationality: form.nationality,
    gender: form.gender,
    birth_date: form.dob,
    marital_status: form.marital_status,
    company_id: form.company_id,
    branch_id: form.branch_id,
    department_id: form.department_id,
    job_title: form.job_title,
    hire_date: form.hire_date,
    contract_type: form.contract_type,
    bank_name: form.bank_name,
    iban: form.iban,
    is_active: form.is_active ?? form.account_enabled ?? true
  };
}

export const fullEmployeeService = {
  async getEmployeeById(id: number): Promise<EmployeeProfileFull> {
    const raw = await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`);
    if (!raw || Array.isArray(raw)) {
      throw new Error(`تعذر تحميل بيانات الموظف (المعرف: ${id}) من قاعدة البيانات`);
    }
    return mapEmployeeApiToForm(raw);
  },

  async getDropdownOptions(): Promise<DropdownOptionsFull> {
    try {
      const companies = await fetchApi<any[]>(`${API_CONFIG.PHP_API_URL}?route=companies`);
      return {
        companies: Array.isArray(companies) ? companies.map(c => ({ id: Number(c.id), name_ar: c.name_ar })) : [],
        branches: [
          { id: 1, name_ar: 'الفرع الرئيسي - الرياض (HQ)' },
          { id: 2, name_ar: 'فرع الفيحاء' },
          { id: 3, name_ar: 'فرع مكة المكرمة' }
        ],
        departments: [
          { id: 1, name_ar: 'تقنية المعلومات والأنظمة (IT)' },
          { id: 2, name_ar: 'الموارد البشرية (HR)' },
          { id: 3, name_ar: 'الشؤون المالية والحسابات' },
          { id: 4, name_ar: 'التصميم وتجربة المستخدم' }
        ],
        jobTitles: [
          { id: 1, name_ar: 'كبير مهندسي النظم والتقنية' },
          { id: 2, name_ar: 'مدير قسم تقنية المعلومات' },
          { id: 3, name_ar: 'أخصائي أول موارد بشرية' },
          { id: 4, name_ar: 'مراقب ماليات وحسابات' },
          { id: 5, name_ar: 'مطور واجهات ومصمم تجربة' }
        ],
        managers: [
          { id: 1, name_ar: 'سعد العتيبي (المدير التنفيذي)' },
          { id: 2, name_ar: 'خالد الشهري (مدير العمليات)' }
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
          { id: 4, name_ar: 'موظف قياسي (Employee)' }
        ],
        banks: [
          { id: 'SNB', name_ar: 'البنك الأهلي السعودي (SNB)' },
          { id: 'RJHI', name_ar: 'مصرف الراجحي' },
          { id: 'RIBL', name_ar: 'بنك الرياض' },
          { id: 'INMA', name_ar: 'مصرف الإنماء' }
        ],
        nationalities: [
          { id: 'SA', name_ar: 'سعودي' },
          { id: 'EG', name_ar: 'مصري' },
          { id: 'JO', name_ar: 'أردني' }
        ]
      };
    } catch {
      return {
        companies: [{ id: 1, name_ar: 'شركة الحلول المتقدمة (Solutions Co)' }],
        branches: [{ id: 1, name_ar: 'الفرع الرئيسي - الرياض HQ' }],
        departments: [{ id: 1, name_ar: 'تقنية المعلومات' }],
        jobTitles: [{ id: 1, name_ar: 'كبير مهندسي النظم' }],
        managers: [{ id: 1, name_ar: 'سعد العتيبي' }],
        shifts: [{ id: 1, name_ar: 'الشفت الصباحي الأساسي' }],
        locations: [{ id: 1, name_ar: 'مقر Fayha Branch الرئيسي' }],
        roles: [{ id: 1, name_ar: 'مدير نظام (Super Admin)' }],
        banks: [{ id: 'SNB', name_ar: 'البنك الأهلي السعودي (SNB)' }],
        nationalities: [{ id: 'SA', name_ar: 'سعودي' }]
      };
    }
  },

  async updateEmployee(id: number, data: Partial<EmployeeProfileFull>): Promise<EmployeeProfileFull> {
    const payload = mapEmployeeFormToApi(data);
    const raw = await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return mapEmployeeApiToForm(raw);
  }
};
