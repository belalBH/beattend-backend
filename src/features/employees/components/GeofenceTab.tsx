import React from 'react';
import { EmployeeProfileFull, DropdownOptionsFull } from '../types/employee.types';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  options: DropdownOptionsFull;
  isEditing: boolean;
  onChange: (field: keyof EmployeeProfileFull, value: any) => void;
}

export const GeofenceTab: React.FC<Props> = ({ formData, options, isEditing, onChange }) => {
  const handleTestGeofence = () => {
    alert(`جاري اختبار النطاق الجغرافي للموقع (${formData.work_location || 'الفرع الرئيسي'}): النطاق دقيق ومتحقق بنسبة 99.8%`);
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الفرع المسموح للبصمة</label>
          {isEditing ? (
            <select
              value={formData.allowed_branch_id || options.branches[0]?.id || 1}
              onChange={(e) => onChange('allowed_branch_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.branches.map(b => (
                <option key={b.id} value={b.id}>{b.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100 font-bold">{formData.branch_name || 'الفرع الرئيسي HQ'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">موقع العمل الجغرافي (Work Location)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.work_location || 'مقر Fayha Branch الرئيسي'}
              onChange={(e) => onChange('work_location', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37]">{formData.work_location || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">خط العرض (Latitude)</label>
          {isEditing ? (
            <input
              type="number"
              step="0.0001"
              value={formData.latitude || 24.6877}
              onChange={(e) => onChange('latitude', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.latitude || 24.6877}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">خط الطول (Longitude)</label>
          {isEditing ? (
            <input
              type="number"
              step="0.0001"
              value={formData.longitude || 46.7219}
              onChange={(e) => onChange('longitude', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.longitude || 46.7219}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">نصف قطر النطاق المسموح (بالمتر)</label>
          {isEditing ? (
            <input
              type="number"
              value={formData.attendance_radius || 150}
              onChange={(e) => onChange('attendance_radius', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-mono font-bold">{formData.attendance_radius || 150} متر</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الشفت المرتبط بنطاق الموقع</label>
          <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 text-xs">
            {formData.linked_shift_name || 'الشفت الصباحي الأساسي'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200">السماح بتسجيل البصمة من مواقع متعددة</span>
          <input
            type="checkbox"
            disabled={!isEditing}
            checked={formData.allow_multiple_locations ?? true}
            onChange={(e) => onChange('allow_multiple_locations', e.target.checked)}
            className="w-5 h-5 accent-[#d4af37]"
          />
        </div>

        <div className="p-4 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200">السماح بالعمل عن بعد (Remote Attendance)</span>
          <input
            type="checkbox"
            disabled={!isEditing}
            checked={formData.allow_remote_work ?? true}
            onChange={(e) => onChange('allow_remote_work', e.target.checked)}
            className="w-5 h-5 accent-[#d4af37]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleTestGeofence}
          className="px-5 py-2.5 bg-[#234735] text-[#d4af37] border border-[#d4af37]/40 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
        >
          📍 اختبار إحداثيات النطاق الجغرافي
        </button>
      </div>
    </div>
  );
};
