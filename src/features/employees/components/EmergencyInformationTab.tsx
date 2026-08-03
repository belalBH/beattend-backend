import React from 'react';
import { EmployeeProfileFull } from '../types/employee.types';
import { FieldErrorsFull } from '../validation/employee.validation';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  isEditing: boolean;
  onChange: (field: keyof EmployeeProfileFull, value: any) => void;
  errors: FieldErrorsFull;
}

export const EmergencyInformationTab: React.FC<Props> = ({ formData, isEditing, onChange, errors }) => {
  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم جهة الاتصال للطوارئ</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.emergency_name || ''}
              onChange={(e) => onChange('emergency_name', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl font-bold text-slate-100">{formData.emergency_name || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">صلة القرابة</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.emergency_relationship || 'أخ / والد'}
              onChange={(e) => onChange('emergency_relationship', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.emergency_relationship || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم جوال الطوارئ الأساسي</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.emergency_phone || ''}
              onChange={(e) => onChange('emergency_phone', e.target.value)}
              className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.emergency_phone ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-mono">{formData.emergency_phone || '-'}</div>
          )}
          {errors.emergency_phone && <p className="text-xs text-red-400 mt-1">{errors.emergency_phone}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم جوال إضافي للطوارئ</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.emergency_secondary_phone || ''}
              onChange={(e) => onChange('emergency_secondary_phone', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.emergency_secondary_phone || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">البريد الإلكتروني للطوارئ</label>
          {isEditing ? (
            <input
              type="email"
              value={formData.emergency_email || ''}
              onChange={(e) => onChange('emergency_email', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.emergency_email || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">عنوان الطوارئ</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.emergency_address || ''}
              onChange={(e) => onChange('emergency_address', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.emergency_address || '-'}</div>
          )}
        </div>
      </div>
    </div>
  );
};
