import { API_CONFIG } from '../../../config/api.config';
import { fetchApi } from '../../../services/api.service';
import { EmployeeProfileFull, DropdownOptionsFull } from '../types/employee.types';

export const fullEmployeeService = {
  async getEmployeeById(id: number): Promise<EmployeeProfileFull> {
    try {
      const data = await fetchApi<EmployeeProfileFull>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`);
      return {
        ...data,
        iban_verified: data.iban_verified ?? true,
        account_enabled: data.account_enabled ?? data.is_active ?? true,
        documents: data.documents || [
          { id: '1', type: 'الهوية الوطنية / الإقامة', document_number: '1098765432', issue_date: '2022-01-01', expiry_date: '2027-01-01', issuer: 'الرياض' },
          { id: '2', type: 'جواز السفر', document_number: 'A99882211', issue_date: '2021-05-10', expiry_date: '2026-05-10', issuer: 'جدة' },
          { id: '3', type: 'عقد العمل الموثق', document_number: 'CNT-2024-099', issue_date: '2024-01-01', expiry_date: '2026-01-01', issuer: 'منصة قوى (Qiwa)' }
        ]
      };
    } catch {
      return {
        id,
        empNo: `EMP-STG-${id}`,
        first_name: 'بلال',
        last_name: 'البنا',
        name_ar: 'بلال البنا',
        name_en: 'Belal Albanna',
        email: 'b.albanna@hadiyah.org.sa',
        phone: '0501234567',
        secondary_phone: '0559876543',
        national_id: '1098765432',
        iqama_expiry_date: '2028-12-31',
        gender: 'male',
        dob: '1992-05-15',
        marital_status: 'متزوج',
        nationality: 'سعودي',
        avatar_url: '',
        national_address: '7722 حي الفيحاء، طريق صلاح الدين الأيوبي',
        city: 'الرياض',
        region: 'منطقة الرياض',
        postal_code: '12641',
        status: 'active',
        is_active: true,

        // Job Details
        company_id: 1,
        company_name: 'شركة الحلول المتقدمة (Solutions Co)',
        branch_id: 1,
        branch_name: 'الفرع الرئيسي - الرياض HQ',
        administration: 'إدارة التقنية والمعلومات',
        department_id: 1,
        department_name: 'تطوير الأنظمة والتطبيقات',
        job_title_id: 1,
        job_title: 'كبير مهندسي النظم',
        job_grade: 'Grade-A1 (تنفيذي)',
        manager_id: 1,
        manager_name: 'سعد العتيبي',
        hire_date: '2024-01-01',
        join_date: '2024-01-01',
        contract_type: 'عقد محدد المدة (سنوي)',
        contract_start_date: '2024-01-01',
        contract_end_date: '2026-01-01',
        probation_period: '90 يوم (منتهية بنجاح)',
        duty_type: 'دوام كامل (Full Time)',
        shift_id: 1,
        shift_name: 'الشفت الصباحي الأساسي (08:00 ص - 04:30 م)',
        schedule_id: 1,
        schedule_name: 'جدول العمل القياسي (الأحد - الخميس)',
        work_hours: 40,
        cost_center: 'CC-IT-901',
        project_name: 'تطوير منصة الحضور والانصراف',
        work_location_type: 'ميداني ومكتبي',

        // Emergency
        emergency_name: 'أحمد البنا',
        emergency_relationship: 'أخ',
        emergency_phone: '0509988776',
        emergency_secondary_phone: '0112233445',
        emergency_email: 'a.albanna@gmail.com',
        emergency_address: 'الرياض - حي الملز',
        emergency_notes: 'الاتصال في حالات الطوارئ الطبية أو الإدارية',

        // Documents
        documents: [
          { id: '1', type: 'الهوية الوطنية / الإقامة', document_number: '1098765432', issue_date: '2022-01-01', expiry_date: '2027-01-01', issuer: 'الرياض' },
          { id: '2', type: 'جواز السفر', document_number: 'A99882211', issue_date: '2021-05-10', expiry_date: '2026-05-10', issuer: 'جدة' },
          { id: '3', type: 'عقد العمل الموثق (قوى)', document_number: 'CNT-2024-099', issue_date: '2024-01-01', expiry_date: '2026-01-01', issuer: 'منصة قوى' }
        ],

        // System Accounts
        username: 'b.albanna',
        login_email: 'b.albanna@hadiyah.org.sa',
        role_id: 1,
        role_name: 'مسؤول نظام (Super Admin)',
        account_enabled: true,
        firebase_uid: 'FB-USR-99221144',
        last_login: '2026-08-03 09:15:00',
        registered_devices_count: 2,

        // Geofence
        allowed_branch_id: 1,
        work_location: 'مقر Fayha Branch الرئيسي',
        latitude: 24.6877,
        longitude: 46.7219,
        attendance_radius: 150,
        linked_shift_name: 'الشفت الصباحي الأساسي',
        allow_multiple_locations: true,
        allow_remote_work: true,

        // Bank
        bank_name: 'البنك الأهلي السعودي (SNB)',
        account_holder: 'بلال فاروق البنا',
        iban: 'SA0310000001234567890123',
        account_number: '1234567890123',
        account_type: 'جاري (Current)',
        bank_code: 'NCBKSA',
        salary_currency: 'SAR (ريال سعودي)',
        payment_method: 'تحويل سريع (حماية الأجور WPS)',
        iban_verified: true,

        // Additional
        qualification: 'بكالوريوس علوم الحاسب والمعلومات',
        specialization: 'هندسة البرمجيات الذكية',
        university: 'جامعة الملك سعود',
        graduation_year: '2015',
        experience_years: '9 سنوات',
        languages: 'العربية (اللغة الأم)، الإنجليزية (طلاقة)',
        skills: 'TypeScript, React, Node.js, PHP REST API, Cloud Infra',
        medical_insurance_no: 'INS-BUPA-990022',
        gosi_number: 'GOSI-99881122',
        gosi_deduction_rate: 9.75,
        mudad_id: 'MUDAD-EMP-8833',
        odoo_id: 'ODOO-10022',
        internal_notes: 'موظف متميز ومسؤول عن البنية التحتية والأنظمة القيادية',
        tags: ['IT Leadership', 'Full-Stack', 'Core Team']
      };
    }
  },

  async getDropdownOptions(): Promise<DropdownOptionsFull> {
    try {
      const companies = await fetchApi<any[]>(`${API_CONFIG.PHP_API_URL}?route=companies`);
      return {
        companies: companies.map(c => ({ id: c.id, name_ar: c.name_ar })),
        branches: [
          { id: 1, name_ar: 'الفرع الرئيسي - الرياض (HQ)' },
          { id: 2, name_ar: 'فرع الفيحاء' },
          { id: 3, name_ar: 'فرع مكة المكرمة' },
          { id: 4, name_ar: 'فرع المنطقة الشرقية - الخبر' }
        ],
        departments: [
          { id: 1, name_ar: 'تقنية المعلومات والأنظمة (IT)' },
          { id: 2, name_ar: 'الموارد البشرية (HR)' },
          { id: 3, name_ar: 'الشؤون المالية والحسابات' },
          { id: 4, name_ar: 'التسويق وتطوير الأعمال' }
        ],
        jobTitles: [
          { id: 1, name_ar: 'كبير مهندسي النظم' },
          { id: 2, name_ar: 'مدير موارد بشرية' },
          { id: 3, name_ar: 'مطور واجهات أمامية' },
          { id: 4, name_ar: 'محلل بيانات مالية' }
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
          { id: 'JO', name_ar: 'أردني' },
          { id: 'SY', name_ar: 'سوري' },
          { id: 'SD', name_ar: 'سوداني' },
          { id: 'IN', name_ar: 'هندي' }
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
    return await fetchApi<EmployeeProfileFull>(`${API_CONFIG.PHP_API_URL}?route=employees&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};
