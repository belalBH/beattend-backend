import React from 'react';
import { EmployeeProfileFull, DropdownOptionsFull } from '../types/employee.types';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  options: DropdownOptionsFull;
  isEditing: boolean;
  onChange: (field: keyof EmployeeProfileFull, value: any) => void;
}

export const JobInformationTab: React.FC<Props> = ({ formData, options, isEditing, onChange }) => {
  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الشركة التابع لها</label>
          {isEditing ? (
            <select
              value={formData.company_id || options.companies[0]?.id || 1}
              onChange={(e) => onChange('company_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.companies.map(c => (
                <option key={c.id} value={c.id}>{c.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-bold">{formData.company_name || 'Solutions Co'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الفرع المعتمد</label>
          {isEditing ? (
            <select
              value={formData.branch_id || options.branches[0]?.id || 1}
              onChange={(e) => onChange('branch_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.branches.map(b => (
                <option key={b.id} value={b.id}>{b.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100">{formData.branch_name || 'الفرع الرئيسي HQ'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الإدارة الإشرافية</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.administration || 'إدارة تقنية المعلومات'}
              onChange={(e) => onChange('administration', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.administration || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">القسم الإداري</label>
          {isEditing ? (
            <select
              value={formData.department_id || options.departments[0]?.id || 1}
              onChange={(e) => onChange('department_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.departments.map(d => (
                <option key={d.id} value={d.id}>{d.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.department_name || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">المسمى الوظيفي</label>
          {isEditing ? (
            <select
              value={formData.job_title_id || options.jobTitles[0]?.id || 1}
              onChange={(e) => onChange('job_title_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.jobTitles.map(j => (
                <option key={j.id} value={j.id}>{j.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.job_title || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الدرجة الوظيفية</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.job_grade || 'Grade-A1 (تنفيذي)'}
              onChange={(e) => onChange('job_grade', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.job_grade || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">المدير المباشر</label>
          {isEditing ? (
            <select
              value={formData.manager_id || options.managers[0]?.id || 1}
              onChange={(e) => onChange('manager_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.managers.map(m => (
                <option key={m.id} value={m.id}>{m.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.manager_name || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">تاريخ التعيين</label>
          {isEditing ? (
            <input
              type="date"
              value={formData.hire_date || ''}
              onChange={(e) => onChange('hire_date', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.hire_date || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">نوع العقد</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.contract_type || 'عقد محدد المدة'}
              onChange={(e) => onChange('contract_type', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.contract_type || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">مناوبة العمل (Shift)</label>
          {isEditing ? (
            <select
              value={formData.shift_id || options.shifts[0]?.id || 1}
              onChange={(e) => onChange('shift_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.shifts.map(s => (
                <option key={s.id} value={s.id}>{s.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.shift_name || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">مركز التكلفة (Cost Center)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.cost_center || 'CC-IT-901'}
              onChange={(e) => onChange('cost_center', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.cost_center || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">المشروع القائم عليه</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.project_name || 'منصة الحضور والانصراف'}
              onChange={(e) => onChange('project_name', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.project_name || '-'}</div>
          )}
        </div>
      </div>
    </div>
  );
};
