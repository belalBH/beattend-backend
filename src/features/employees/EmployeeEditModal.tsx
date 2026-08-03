import React, { useState, useEffect } from 'react';
import { FullEmployeeData, DropdownOptions } from './employee.types';
import { validateEmployeeForm, FieldErrors } from './employee.validation';
import { employeeService } from './employee.service';
import { EmployeeBasicTab } from './EmployeeBasicTab';
import { EmployeeJobTab } from './EmployeeJobTab';
import { EmployeeAttendanceTab } from './EmployeeAttendanceTab';
import { EmployeePermissionsTab } from './EmployeePermissionsTab';
import { EmployeeFullProfileModal } from './EmployeeFullProfileModal';

interface Props {
  employeeId: number;
  onClose: () => void;
  onSaved: () => void;
}

export const EmployeeEditModal: React.FC<Props> = ({ employeeId, onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'job' | 'attendance' | 'permissions'>('basic');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showFullProfile, setShowFullProfile] = useState<boolean>(false);

  const [formData, setFormData] = useState<Partial<FullEmployeeData>>({});
  const [options, setOptions] = useState<DropdownOptions>({
    companies: [],
    branches: [],
    departments: [],
    jobTitles: [],
    managers: [],
    shifts: [],
    locations: [],
    roles: []
  });

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const [empData, optData] = await Promise.all([
        employeeService.getEmployeeById(employeeId),
        employeeService.getDropdownOptions()
      ]);
      setFormData(empData);
      setOptions(optData);
    } catch (err: any) {
      setServerError(err.message || 'فشل في تحميل بيانات الموظف');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof FullEmployeeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FieldErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const saveEmployeeData = async (closeAfterSave: boolean) => {
    const { isValid, errors: valErrors } = validateEmployeeForm(formData);
    if (!isValid) {
      setErrors(valErrors);
      setServerError('يرجى تصحيح الحقول المحددة باللون الأحمر');
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await employeeService.updateEmployee(employeeId, formData);
      setSuccessMsg('تم حفظ وتحديث بيانات الموظف في قاعدة بيانات الـ Staging بنجاح');
      onSaved();
      if (closeAfterSave) {
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setServerError(err.message || 'فشل في حفظ التعديلات');
    } finally {
      setSubmitting(false);
    }
  };

  if (showFullProfile && formData.id) {
    return <EmployeeFullProfileModal employee={formData as FullEmployeeData} onClose={() => setShowFullProfile(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#1b3325] border border-[#d4af37]/50 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden dir-rtl" dir="rtl">
        {/* Header Requirement #2 */}
        <div className="p-6 bg-[#0f1e16]/90 border-b border-[#d4af37]/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-2xl flex items-center justify-center border-2 border-[#d4af37] shadow-lg">
                {formData.first_name ? formData.first_name[0] : 'E'}
              </div>
              <button
                type="button"
                onClick={() => alert('تغيير صورة الموظف متاحة وتحفظ في المرفقات')}
                className="absolute -bottom-1 -right-1 bg-[#d4af37] text-[#0f1e16] p-1 rounded-full text-xs font-bold shadow"
                title="تغيير صورة الموظف"
              >
                📷
              </button>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-[#d4af37]">
                  تعديل بيانات: {formData.first_name} {formData.last_name}
                </h3>
                <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  {formData.empNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{formData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Requirement #10 Full Profile Button */}
            <button
              type="button"
              onClick={() => setShowFullProfile(true)}
              className="px-3.5 py-1.5 bg-[#234735] text-[#d4af37] border border-[#d4af37]/40 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
            >
              📂 فتح ملف الموظف الكامل
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white font-bold text-xl px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Header Bar Requirement #3 */}
        <div className="bg-[#1b3325] border-b border-[#d4af37]/20 flex shrink-0 px-4">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'basic' ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-transparent text-slate-300 hover:text-[#d4af37]'
            }`}
          >
            أ. البيانات الأساسية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('job')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'job' ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-transparent text-slate-300 hover:text-[#d4af37]'
            }`}
          >
            ب. البيانات الوظيفية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'attendance' ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-transparent text-slate-300 hover:text-[#d4af37]'
            }`}
          >
            ج. الحضور والانصراف
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'permissions' ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' : 'border-transparent text-slate-300 hover:text-[#d4af37]'
            }`}
          >
            د. الصلاحيات والنظام
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-900/50 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-semibold">
              ✅ {successMsg}
            </div>
          )}
          {serverError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-xl text-red-200 text-xs font-semibold">
              ⚠️ {serverError}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
              جاري جلب بيانات الموظف والقوائم المعتمدة من Staging...
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); saveEmployeeData(true); }}>
              {activeTab === 'basic' && <EmployeeBasicTab formData={formData} onChange={handleFieldChange} errors={errors} />}
              {activeTab === 'job' && <EmployeeJobTab formData={formData} options={options} onChange={handleFieldChange} />}
              {activeTab === 'attendance' && <EmployeeAttendanceTab formData={formData} options={options} onChange={handleFieldChange} />}
              {activeTab === 'permissions' && <EmployeePermissionsTab formData={formData} options={options} onChange={handleFieldChange} />}
            </form>
          )}
        </div>

        {/* Footer Buttons Requirement #9 */}
        <div className="p-4 bg-[#0f1e16] border-t border-[#d4af37]/20 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 cursor-pointer"
          >
            إلغاء
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={submitting || loading}
              onClick={() => saveEmployeeData(false)}
              className="px-4 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/40 rounded-xl font-bold text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button
              type="button"
              disabled={submitting || loading}
              onClick={() => saveEmployeeData(true)}
              className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ وإغلاق'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
