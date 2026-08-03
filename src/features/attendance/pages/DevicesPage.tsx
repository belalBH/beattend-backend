import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { RegisteredDeviceItem } from '../types/attendance.types';

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<RegisteredDeviceItem[]>([]);

  useEffect(() => {
    attendanceService.getDevices().then(setDevices);
  }, []);

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="bg-[#1b3325]/90 p-6 rounded-2xl border border-[#d4af37]/30 shadow-2xl">
        <h2 className="text-xl font-bold text-[#d4af37]">إدارة الأجهزة المسجلة والموثوقة للبصمة (Registered Devices)</h2>
        <p className="text-xs text-slate-400 mt-1">سجل الأجهزة الموثوقة، معرّفات الموبايل Unique Device IDs، وإصدارات التطبيق</p>
      </div>

      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
            <tr>
              <th className="p-4">اسم الموظف</th>
              <th className="p-4">نوع الجهاز</th>
              <th className="p-4">نظام التشغيل</th>
              <th className="p-4">معرف الجهاز (Device ID)</th>
              <th className="p-4">إصدار التطبيق</th>
              <th className="p-4">حالة التوثيق</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
            {devices.map((dev) => (
              <tr key={dev.id} className="hover:bg-[#d4af37]/5 transition">
                <td className="p-4 font-bold">{dev.employee_name} ({dev.empNo})</td>
                <td className="p-4 text-slate-200">{dev.device_name}</td>
                <td className="p-4 font-mono text-slate-300">{dev.os_version}</td>
                <td className="p-4 font-mono text-[#d4af37] text-xs">{dev.device_id}</td>
                <td className="p-4 font-mono text-slate-400 text-xs">{dev.app_version}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                    ✓ جهاز موثوق
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => alert(`إلغاء توثيق جهاز الموظف: ${dev.employee_name}`)}
                    className="px-3 py-1 bg-red-900/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition cursor-pointer"
                  >
                    🚫 إلغاء التوثيق
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
