import { EmployeeProfileFull } from '../types/employee.types';

export interface FieldErrorsFull {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  empNo?: string;
  national_id?: string;
  iban?: string;
  emergency_phone?: string;
}

export function validateEmployeeProfileForm(data: Partial<EmployeeProfileFull>): { isValid: boolean; errors: FieldErrorsFull } {
  const errors: FieldErrorsFull = {};

  if (!data.first_name || data.first_name.trim().length === 0) {
    errors.first_name = 'الاسم الأول حقل إجباري';
  }

  if (!data.last_name || data.last_name.trim().length === 0) {
    errors.last_name = 'اسم العائلة حقل إجباري';
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'البريد الإلكتروني حقل إجباري';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
  }

  if (data.phone && data.phone.trim().length > 0 && !/^[0-9+\s-]{8,20}$/.test(data.phone.trim())) {
    errors.phone = 'رقم الجوال يجب أن يتكون من 8 إلى 20 رقم';
  }

  if (data.emergency_phone && data.emergency_phone.trim().length > 0 && !/^[0-9+\s-]{8,20}$/.test(data.emergency_phone.trim())) {
    errors.emergency_phone = 'رقم جوال الطوارئ غير صحيح';
  }

  if (data.national_id && data.national_id.trim().length > 0 && !/^[0-9]{10}$/.test(data.national_id.trim())) {
    errors.national_id = 'رقم الهوية / الإقامة يجب أن يتكون من 10 أرقام';
  }

  if (data.iban && data.iban.trim().length > 0 && !/^SA[0-9]{22}$/i.test(data.iban.trim())) {
    errors.iban = 'صيغة رقم الآيبان يجب أن تبدأ بـ SA متبوعة بـ 22 رقم (SA... 24 خانة)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
