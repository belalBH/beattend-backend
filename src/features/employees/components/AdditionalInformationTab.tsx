import React from 'react';
import { EmployeeProfileFull } from '../types/employee.types';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  isEditing: boolean;
  onChange: (field: keyof EmployeeProfileFull, value: any) => void;
}

export const AdditionalInformationTab: React.FC<Props> = ({ formData, isEditing, onChange }) => {
  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">المؤهل العلمي</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.qualification || 'بكالوريوس علوم الحاسب'}
              onChange={(e) => onChange('qualification', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100 font-bold">{formData.qualification || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">التخصص الدقيق</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.specialization || 'هندسة البرمجيات الذكية'}
              onChange={(e) => onChange('specialization', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.specialization || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الجامعة / الكلية</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.university || 'جامعة الملك سعود'}
              onChange={(e) => onChange('university', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.university || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">سنة التخرج</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.graduation_year || '2015'}
              onChange={(e) => onChange('graduation_year', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.graduation_year || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">سنوات الخبرة</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.experience_years || '9 سنوات'}
              onChange={(e) => onChange('experience_years', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.experience_years || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم التأمين الطبي (Bupa / Tawuniya)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.medical_insurance_no || 'INS-BUPA-990022'}
              onChange={(e) => onChange('medical_insurance_no', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.medical_insurance_no || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم التأمينات الاجتماعية (GOSI)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.gosi_number || 'GOSI-99881122'}
              onChange={(e) => onChange('gosi_number', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.gosi_number || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">نسبة خصم التأمينات الاجتماعية (%)</label>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={formData.gosi_deduction_rate || 9.75}
              onChange={(e) => onChange('gosi_deduction_rate', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-mono font-bold">{formData.gosi_deduction_rate || 9.75}%</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الموظف في منصة "مدد" (MUDAD)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.mudad_id || 'MUDAD-EMP-8833'}
              onChange={(e) => onChange('mudad_id', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.mudad_id || '-'}</div>
          )}
        </div>
      </div>

      <div className="bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20">
        <label className="block text-xs text-slate-300 mb-2 font-semibold">ملاحظات إدارية داخلية (Internal Notes)</label>
        {isEditing ? (
          <textarea
            rows={3}
            value={formData.internal_notes || ''}
            onChange={(e) => onChange('internal_notes', e.target.value)}
            className="w-full p-4 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          />
        ) : (
          <div className="p-4 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-300 text-sm leading-relaxed">
            {formData.internal_notes || 'لا توجد ملاحظات إدارية مدونة.'}
          </div>
        )}
      </div>
    </div>
  );
};
