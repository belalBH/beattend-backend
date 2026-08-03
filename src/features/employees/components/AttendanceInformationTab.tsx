import React from 'react';

export const AttendanceInformationTab: React.FC = () => {
  return (
    <div className="space-y-4 text-right dir-rtl" dir="rtl">
      <h4 className="font-bold text-[#d4af37]">سجل الحضور والبصمات المعتمدة من جهاز الموظف:</h4>
      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
            <tr>
              <th className="p-4">التاريخ</th>
              <th className="p-4">وقت الدخول</th>
              <th className="p-4">وقت الخروج</th>
              <th className="p-4">الموقع الجغرافي</th>
              <th className="p-4">ساعات العمل</th>
              <th className="p-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10 text-slate-200 font-mono">
            <tr className="hover:bg-[#d4af37]/5 transition">
              <td className="p-4">2026-08-03</td>
              <td className="p-4 text-emerald-400">08:00 AM</td>
              <td className="p-4 text-amber-400">04:30 PM</td>
              <td className="p-4 text-slate-300 font-sans">مقر Fayha Branch الرئيسي</td>
              <td className="p-4 text-[#d4af37]">8.5 س</td>
              <td className="p-4 font-sans"><span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs">مكتمل ومقبول</span></td>
            </tr>
            <tr className="hover:bg-[#d4af37]/5 transition">
              <td className="p-4">2026-08-02</td>
              <td className="p-4 text-emerald-400">08:15 AM</td>
              <td className="p-4 text-amber-400">04:30 PM</td>
              <td className="p-4 text-slate-300 font-sans">مقر Fayha Branch الرئيسي</td>
              <td className="p-4 text-[#d4af37]">8.25 س</td>
              <td className="p-4 font-sans"><span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs">تأخير 15 دقيقة</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
