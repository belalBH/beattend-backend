import { FullEmployeeData } from './employee.types';

export interface FieldErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  empNo?: string;
  national_id?: string;
}

export function validateEmployeeForm(data: Partial<FullEmployeeData>): { isValid: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {};

  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.first_name = 'الاسم الأول حقل إجباري';
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.last_name = 'الاسم الأخير حقل إجباري';
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'البريد الإلكتروني حقل إجباري';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
  }

  if (data.phone && data.phone.trim().length > 0 && !/^[0-9+\s-]{8,20}$/.test(data.phone.trim())) {
    errors.phone = 'رقم الجوال يجب أن يتكون من أرقام فقط (8-20 رقم)';
  }

  if (data.national_id && data.national_id.trim().length > 0 && !/^[0-9]{10}$/.test(data.national_id.trim())) {
    errors.national_id = 'رقم الهوية / الإقامة يجب أن يتكون من 10 أرقام';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
