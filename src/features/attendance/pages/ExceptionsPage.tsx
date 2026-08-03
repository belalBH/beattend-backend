import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { ExceptionItem } from '../types/attendance.types';

export const ExceptionsPage: React.FC = () => {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);

  useEffect(() => {
    attendanceService.getExceptions().then(setExceptions);
  }, []);

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="bg-[#1b3325]/90 p-6 rounded-2xl border border-[#d4af37]/30 shadow-2xl">
        <h2 className="text-xl font-bold text-[#d4af37]">مركز الاستثناءات والإنذارات الناتجة عن البصمات (Exceptions & Alerts)</h2>
        <p className="text-xs text-slate-400 mt-1">تأخير متكرر، غياب متكرر، بصمة خارج النطاق، وبصمة بدون انصراف</p>
      </div>

      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
            <tr>
              <th className="p-4">اسم الموظف</th>
              <th className="p-4">نوع الاستثناء</th>
              <th className="p-4">تفاصيل التنبيه</th>
              <th className="p-4">مستوى الخطورة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
            {exceptions.map((ex) => (
              <tr key={ex.id} className="hover:bg-[#d4af37]/5 transition">
                <td className="p-4 font-bold">{ex.employee_name}</td>
                <td className="p-4 font-bold text-amber-400">{ex.type}</td>
                <td className="p-4 text-xs text-slate-300">{ex.description}</td>
                <td className="p-4 font-bold text-[#d4af37]">{ex.risk_level}</td>
                <td className="p-4 font-mono text-slate-300">{ex.status}</td>
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => alert(`معالجة استثناء: ${ex.type} للموظف ${ex.employee_name}`)}
                    className="px-3 py-1 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs font-semibold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                  >
                    🛠️ اتخاذ إجراء
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
