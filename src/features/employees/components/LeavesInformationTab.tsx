import React from 'react';

export const LeavesInformationTab: React.FC = () => {
  return (
    <div className="space-y-4 text-right dir-rtl" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-[#0f1e16] border border-[#d4af37]/30 rounded-2xl">
          <span className="text-xs text-slate-400">رصيد الإجازات السنوية المستحق</span>
          <p className="text-2xl font-bold text-[#d4af37] font-mono mt-1">21 يوم</p>
        </div>
        <div className="p-4 bg-[#0f1e16] border border-[#d4af37]/30 rounded-2xl">
          <span className="text-xs text-slate-400">الإجازات المستهلكة هذا العام</span>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-1">5 أيام</p>
        </div>
        <div className="p-4 bg-[#0f1e16] border border-[#d4af37]/30 rounded-2xl">
          <span className="text-xs text-slate-400">الرصيد المتبقي المتاح</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">16 يوم</p>
        </div>
      </div>

      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
            <tr>
              <th className="p-4">نوع الإجازة</th>
              <th className="p-4">تاريخ البدء</th>
              <th className="p-4">تاريخ الانتهاء</th>
              <th className="p-4">المدة</th>
              <th className="p-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
            <tr className="hover:bg-[#d4af37]/5 transition">
              <td className="p-4 font-bold">إجازة سنوية اعتيادية</td>
              <td className="p-4 font-mono">2026-08-05</td>
              <td className="p-4 font-mono">2026-08-10</td>
              <td className="p-4 font-mono text-[#d4af37]">5 أيام</td>
              <td className="p-4"><span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs">مقبولة ومصادقة</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
