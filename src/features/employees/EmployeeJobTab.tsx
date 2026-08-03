import React from 'react';
import { FullEmployeeData, DropdownOptions } from './employee.types';

interface Props {
  formData: Partial<FullEmployeeData>;
  options: DropdownOptions;
  onChange: (field: keyof FullEmployeeData, value: any) => void;
}

export const EmployeeJobTab: React.FC<Props> = ({ formData, options, onChange }) => {
  return (
    <div className="space-y-4 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الرقم الوظيفي (Emp No) *</label>
          <input
            type="text"
            required
            value={formData.empNo || ''}
            onChange={(e) => onChange('empNo', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الشركة التابع لها</label>
          <select
            value={formData.company_id || options.companies[0]?.id || 1}
            onChange={(e) => onChange('company_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.companies.map(c => (
              <option key={c.id} value={c.id}>{c.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الفرع المعتمد</label>
          <select
            value={formData.branch_id || options.branches[0]?.id || 1}
            onChange={(e) => onChange('branch_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.branches.map(b => (
              <option key={b.id} value={b.id}>{b.name_ar}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">القسم الإداري</label>
          <select
            value={formData.department_id || options.departments[0]?.id || 1}
            onChange={(e) => onChange('department_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.departments.map(d => (
              <option key={d.id} value={d.id}>{d.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">المسمى الوظيفي</label>
          <select
            value={formData.job_title_id || options.jobTitles[0]?.id || 1}
            onChange={(e) => onChange('job_title_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.jobTitles.map(j => (
              <option key={j.id} value={j.id}>{j.name_ar}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">المدير المباشر</label>
          <select
            value={formData.manager_id || options.managers[0]?.id || 1}
            onChange={(e) => onChange('manager_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.managers.map(m => (
              <option key={m.id} value={m.id}>{m.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">تاريخ التوظيف</label>
          <input
            type="date"
            value={formData.hire_date || ''}
            onChange={(e) => onChange('hire_date', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">نوع العقد</label>
          <input
            type="text"
            value={formData.contract_type || 'دوام كامل (Full-time)'}
            onChange={(e) => onChange('contract_type', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">حالة الموظف</label>
          <select
            value={formData.employment_status || 'active'}
            onChange={(e) => onChange('employment_status', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="active">على رأس العمل (Active)</option>
            <option value="suspended">موقوف مؤقتاً (Suspended)</option>
            <option value="inactive">منتهي الخدمة (Terminated)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
