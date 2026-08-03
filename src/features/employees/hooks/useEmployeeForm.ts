import { useState, useEffect } from 'react';
import { EmployeeProfileFull, DropdownOptionsFull } from '../types/employee.types';
import { validateEmployeeProfileForm, FieldErrorsFull } from '../validation/employee.validation';
import { fullEmployeeService } from '../services/employee.service';

export function useEmployeeForm(employeeId: number, onSavedSuccess?: () => void) {
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [initialData, setInitialData] = useState<Partial<EmployeeProfileFull>>({});
  const [formData, setFormData] = useState<Partial<EmployeeProfileFull>>({});
  const [errors, setErrors] = useState<FieldErrorsFull>({});
  const [options, setOptions] = useState<DropdownOptionsFull>({
    companies: [],
    branches: [],
    departments: [],
    jobTitles: [],
    managers: [],
    shifts: [],
    locations: [],
    roles: [],
    banks: [],
    nationalities: []
  });

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const [empData, optData] = await Promise.all([
        fullEmployeeService.getEmployeeById(employeeId),
        fullEmployeeService.getDropdownOptions()
      ]);
      setInitialData(empData);
      setFormData(empData);
      setOptions(optData);
    } catch (err: any) {
      setServerError(err.message || 'فشل في تحميل ملف الموظف والقوائم');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof EmployeeProfileFull, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FieldErrorsFull]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({ ...initialData });
    setErrors({});
    setServerError(null);
    setSuccessMsg('تمت استعادة القيم السابقة بنجاح');
  };

  const saveEmployee = async (closeAfterSave: boolean, onFinished?: () => void) => {
    const { isValid, errors: valErrors } = validateEmployeeProfileForm(formData);
    if (!isValid) {
      setErrors(valErrors);
      setServerError('يرجى مراجعة وتصحيح الحقول المحددة باللون الأحمر');
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const updated = await fullEmployeeService.updateEmployee(employeeId, formData);
      setInitialData(updated);
      setFormData(updated);
      setIsEditing(false);
      setSuccessMsg('تم حفظ وتحديث ملف الموظف وقاعدة البيانات بنجاح');
      if (onSavedSuccess) onSavedSuccess();
      if (closeAfterSave && onFinished) onFinished();
    } catch (err: any) {
      setServerError(err.message || 'فشل في حفظ التعديلات');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    loading,
    submitting,
    serverError,
    setServerError,
    successMsg,
    setSuccessMsg,
    formData,
    options,
    errors,
    handleFieldChange,
    resetForm,
    saveEmployee
  };
}
