import React from 'react';
import { FullEmployeeData } from './employee.types';
import { FieldErrors } from './employee.validation';

interface Props {
  formData: Partial<FullEmployeeData>;
  onChange: (field: keyof FullEmployeeData, value: any) => void;
  errors: FieldErrors;
}

export const EmployeeBasicTab: React.FC<Props> = ({ formData, onChange, errors }) => {
  return (
    <div className="space-y-4 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الاسم الأول *</label>
          <input
            type="text"
            required
            value={formData.first_name || ''}
            onChange={(e) => onChange('first_name', e.target.value)}
            className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 focus:outline-none ${errors.first_name ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
          />
          {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الاسم الأخير *</label>
          <input
            type="text"
            required
            value={formData.last_name || ''}
            onChange={(e) => onChange('last_name', e.target.value)}
            className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 focus:outline-none ${errors.last_name ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
          />
          {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1 font-semibold">الاسم باللغة الإنجليزية</label>
        <input
          type="text"
          value={formData.name_en || ''}
          onChange={(e) => onChange('name_en', e.target.value)}
          className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">البريد الإلكتروني *</label>
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.email ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الجوال</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.phone ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
          />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الهوية / الإقامة</label>
          <input
            type="text"
            value={formData.national_id || ''}
            onChange={(e) => onChange('national_id', e.target.value)}
            className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.national_id ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
          />
          {errors.national_id && <p className="text-xs text-red-400 mt-1">{errors.national_id}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الجنس</label>
          <select
            value={formData.gender || 'male'}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">تاريخ الميلاد</label>
          <input
            type="date"
            value={formData.dob || ''}
            onChange={(e) => onChange('dob', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>
    </div>
  );
};
