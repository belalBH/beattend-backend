import React from 'react';
import { FullEmployeeData, DropdownOptions } from './employee.types';

interface Props {
  formData: Partial<FullEmployeeData>;
  options: DropdownOptions;
  onChange: (field: keyof FullEmployeeData, value: any) => void;
}

export const EmployeeAttendanceTab: React.FC<Props> = ({ formData, options, onChange }) => {
  return (
    <div className="space-y-4 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">مناوبة العمل (Shift)</label>
          <select
            value={formData.shift_id || options.shifts[0]?.id || 1}
            onChange={(e) => onChange('shift_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.shifts.map(s => (
              <option key={s.id} value={s.id}>{s.name_ar}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">جدول العمل الأسبوعي</label>
          <input
            type="text"
            value={formData.schedule_name || 'جدول العمل القياسي (الأحد - الخميس)'}
            onChange={(e) => onChange('schedule_name', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">النطاق الجغرافي المعين (Geofence)</label>
          <select
            value={formData.geofence_id || options.locations[0]?.id || 1}
            onChange={(e) => onChange('geofence_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.locations.map(l => (
              <option key={l.id} value={l.id}>{l.name_ar}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">نصف قطر مسموحية البصمة (بالمتر)</label>
          <input
            type="number"
            value={formData.attendance_radius || 150}
            onChange={(e) => onChange('attendance_radius', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-300 mb-1 font-semibold">سياسة البصمة والتحقق الجغرافي</label>
        <input
          type="text"
          value={formData.fingerprint_policy || 'بصمة الجوال + GPS Verified'}
          onChange={(e) => onChange('fingerprint_policy', e.target.value)}
          className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
        />
      </div>

      <div className="flex items-center gap-3 pt-2 p-3 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl">
        <input
          type="checkbox"
          id="remoteWork"
          checked={formData.allow_remote_work ?? true}
          onChange={(e) => onChange('allow_remote_work', e.target.checked)}
          className="w-5 h-5 accent-[#d4af37] cursor-pointer"
        />
        <label htmlFor="remoteWork" className="text-sm text-slate-200 cursor-pointer font-semibold">
          السماح للبصمة من خارج النطاق (العمل عن بعد / Remote Attendance)
        </label>
      </div>
    </div>
  );
};
