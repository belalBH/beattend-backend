import React from 'react';
import { EmployeeProfileFull } from '../types/employee.types';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  isEditing: boolean;
  submitting: boolean;
  onEditToggle: () => void;
  onSave: (closeAfterSave: boolean) => void;
  onReset: () => void;
  onCancel: () => void;
  onBack: () => void;
}

export const EmployeeHeader: React.FC<Props> = ({
  formData,
  isEditing,
  submitting,
  onEditToggle,
  onSave,
  onReset,
  onCancel,
  onBack
}) => {
  return (
    <div className="bg-[#1b3325]/90 border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 dir-rtl" dir="rtl">
      {/* Employee Identity */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-3xl flex items-center justify-center border-2 border-[#d4af37] shadow-xl">
            {formData.first_name ? formData.first_name[0] : 'E'}
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={() => alert('تغيير صورة الموظف متاحة وتحفظ في المرفقات')}
              className="absolute -bottom-1 -right-1 bg-[#d4af37] text-[#0f1e16] p-1.5 rounded-full text-xs font-bold shadow hover:brightness-110 cursor-pointer"
              title="تغيير صورة الموظف"
            >
              📷
            </button>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-black text-[#d4af37]">
              {formData.first_name || ''} {formData.last_name || ''}
            </h1>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold font-mono">
              {formData.empNo || 'EMP-STG'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              formData.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
              {formData.status === 'active' ? 'نشط' : 'غير نشط'}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            {formData.job_title || 'كبير مهندسي النظم'} | {formData.company_name || 'Solutions Co'} | {formData.email || ''}
          </p>
        </div>
      </div>

      {/* Action Control Buttons View Mode vs Edit Mode */}
      <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
        >
          ↩️ عودة لجدول الموظفين
        </button>

        {!isEditing ? (
          <>
            <button
              type="button"
              onClick={onEditToggle}
              className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              ✏️ تعديل البيانات
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
            >
              🖨️ طباعة
            </button>
            <button
              type="button"
              onClick={() => alert('جاري تصدير الملف كـ PDF...')}
              className="px-4 py-2 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition cursor-pointer"
            >
              📄 تحميل PDF
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onReset}
              disabled={submitting}
              className="px-4 py-2 bg-amber-900/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              ↩️ استعادة القيم
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 cursor-pointer disabled:opacity-50"
            >
              ✕ إلغاء
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onSave(false)}
              className="px-4 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/40 rounded-xl font-bold text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onSave(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : '✅ حفظ وإغلاق'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
