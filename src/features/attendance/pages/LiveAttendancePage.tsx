import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { LiveAttendanceItem } from '../types/attendance.types';

export const LiveAttendancePage: React.FC = () => {
  const [liveList, setLiveList] = useState<LiveAttendanceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString('ar-SA'));

  useEffect(() => {
    loadLive();
    const interval = setInterval(() => {
      loadLive();
    }, 30000); // Periodic auto-refresh every 30s Requirement #6
    return () => clearInterval(interval);
  }, []);

  const loadLive = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getLiveAttendance();
      setLiveList(data);
      setLastRefreshed(new Date().toLocaleTimeString('ar-SA'));
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      {/* Live Header Notification */}
      <div className="bg-[#1b3325]/90 border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#d4af37]">شاشة الحضور والتواجد المباشر (Live Monitoring Engine)</h2>
          <p className="text-xs text-slate-400 mt-1">تحديث دوري وتزامن مع الموظفين المسجلين كل 30 ثانية حياً</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-full text-xs text-emerald-400 font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            آخر مزامنة: {lastRefreshed}
          </div>
          <button
            type="button"
            onClick={loadLive}
            className="px-4 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
          >
            🔄 تحديث الآن
          </button>
        </div>
      </div>

      {/* Grid Cards of Employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveList.map((item) => (
          <div key={item.employee_id} className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{item.employee_name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{item.empNo} | {item.company_name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                item.live_state === 'موجود الآن' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                item.live_state === 'غادر المنشأة' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {item.live_state}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-[#d4af37]/10 pt-3 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">توقيت البصمة الحالية:</span>
                <span className="text-[#d4af37] font-bold">{item.last_punch_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">موقع البصمة:</span>
                <span className="text-slate-200">{item.location_name || 'Fayha Branch'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">حالة الجهاز والمصادقة:</span>
                <span className="text-emerald-400">{item.device_status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
