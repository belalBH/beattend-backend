import React from 'react';
import { AttendanceKpis } from '../types/attendance.types';

interface Props {
  kpis: AttendanceKpis;
  loading: boolean;
  onCardClick?: (targetPage: string) => void;
}

export const AttendanceKpiCards: React.FC<Props> = ({ kpis, loading, onCardClick }) => {
  const cardItems = [
    { id: 'live', label: 'الحاضرون الآن', value: kpis.present_now, unit: 'موظف', icon: '🟢', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { id: 'logs', label: 'المتأخرون اليوم', value: kpis.late_today, unit: 'موظف', icon: '⚠️', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { id: 'live', label: 'الغائبون', value: kpis.absent_today, unit: 'موظف', icon: '🔴', color: 'border-red-500/40 text-red-400 bg-red-500/10' },
    { id: 'approvals', label: 'في إجازة رسمية', value: kpis.on_leave, unit: 'موظف', icon: '🏖️', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { id: 'exceptions', label: 'خارج النطاق الجغرافي', value: kpis.out_of_geofence, unit: 'عملية', icon: '📍', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { id: 'live', label: 'لم يبصموا بعد', value: kpis.not_punched_yet, unit: 'موظف', icon: '⏳', color: 'border-slate-500/40 text-slate-300 bg-slate-500/10' },
    { id: 'logs', label: 'متوسط وقت الحضور', value: kpis.avg_arrival_time, unit: '', icon: '⏱️', color: 'border-[#d4af37]/40 text-[#d4af37] bg-[#d4af37]/10' },
    { id: 'logs', label: 'متوسط ساعات العمل', value: kpis.avg_work_hours, unit: '', icon: '📈', color: 'border-[#d4af37]/40 text-[#d4af37] bg-[#d4af37]/10' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 dir-rtl" dir="rtl">
      {cardItems.map((card, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onCardClick && onCardClick(card.id)}
          className={`p-5 rounded-2xl border ${card.color} flex flex-col justify-between items-start text-right transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl cursor-pointer backdrop-blur-md relative overflow-hidden`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0f1e16]/80 text-[#d4af37] border border-[#d4af37]/20 font-bold">
              تحديث حي
            </span>
          </div>

          <div className="mt-3">
            <span className="text-xs text-slate-300 font-semibold block">{card.label}</span>
            {loading ? (
              <span className="text-xl font-bold animate-pulse text-slate-400">...</span>
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl lg:text-3xl font-black font-mono tracking-tight">{card.value}</span>
                {card.unit && <span className="text-xs text-slate-400 font-normal">{card.unit}</span>}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
