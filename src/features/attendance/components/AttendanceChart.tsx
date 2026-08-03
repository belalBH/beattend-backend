import React, { useState } from 'react';
import { ChartDayItem } from '../types/attendance.types';

interface Props {
  data: ChartDayItem[];
}

export const AttendanceChart: React.FC<Props> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<string>('30days');

  return (
    <div className="bg-[#1b3325]/80 border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4 text-right dir-rtl" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d4af37]/20 pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#d4af37]">تحليلات ونسب الحضور والانصراف (Attendance Analytics)</h3>
          <p className="text-xs text-slate-400 mt-0.5">مشررات أداء الحضور والتأخير والغياب والمخالفات الجغرافية</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['today', 'week', 'month', '30days'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeRange === range
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16]'
                  : 'bg-[#0f1e16] text-slate-300 border border-[#d4af37]/20 hover:text-[#d4af37]'
              }`}
            >
              {range === 'today' ? 'اليوم' : range === 'week' ? 'هذا الأسبوع' : range === 'month' ? 'هذا الشهر' : 'آخر 30 يوم'}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Chart Graphic Representation */}
      <div className="space-y-4 pt-2">
        <div className="h-44 flex items-end gap-4 justify-between border-b border-[#d4af37]/20 pb-2 px-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-lg transition-all relative flex flex-col justify-end overflow-hidden border-t-2 border-[#d4af37]" style={{ height: `${item.present_rate}%` }}>
                <span className="text-[10px] text-[#d4af37] font-bold text-center py-1 opacity-0 group-hover:opacity-100 transition">
                  {item.present_rate}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{item.date.split('-').slice(1).join('/')}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-6 text-xs text-slate-300 font-semibold pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>نسبة الحضور الملتزم</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>التأخير</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>الغياب</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span>خارج النطاق</span>
          </div>
        </div>
      </div>
    </div>
  );
};
