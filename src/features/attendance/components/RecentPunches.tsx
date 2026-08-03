import React from 'react';
import { RecentPunchItem } from '../types/attendance.types';

interface Props {
  punches: RecentPunchItem[];
}

export const RecentPunches: React.FC<Props> = ({ punches }) => {
  return (
    <div className="bg-[#1b3325]/80 border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 text-right dir-rtl" dir="rtl">
      <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
        <h3 className="text-lg font-bold text-[#d4af37]">آخر عمليات الحضور والبصمة</h3>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {punches.map((p) => (
          <div key={p.id} className="p-3 bg-[#0f1e16]/80 border border-[#d4af37]/15 rounded-xl hover:border-[#d4af37]/50 transition flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-sm flex items-center justify-center border border-[#d4af37] shadow">
                {p.employee_name ? p.employee_name[0] : 'E'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{p.employee_name}</h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {p.location_name || 'Fayha Branch'} | {p.empNo}
                </p>
              </div>
            </div>

            <div className="text-left space-y-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                p.punch_type === 'انصراف' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {p.punch_type}
              </span>
              <p className="text-xs font-mono font-bold text-[#d4af37]">{p.time_display}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
