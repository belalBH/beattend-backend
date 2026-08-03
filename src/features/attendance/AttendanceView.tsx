import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { AttendanceRecord } from '../../types';

export const AttendanceView: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAttendance();
      setAttendance(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل سجلات الحضور');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل سجلات البصمة الحية من خادم الـ Staging...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-center my-4">
        <p className="font-bold">خطأ في الاتصال بالشبكة:</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadAttendance} className="mt-4 px-4 py-1.5 bg-[#d4af37] text-[#0f1e16] rounded-lg font-bold hover:bg-[#f3e5ab]">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1b3325]/80 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">سجلات الحضور والانصراف المباشرة</h2>
          <p className="text-sm text-slate-400 mt-1">متابعة بصمات الموظفين الحية، الموقع الجغرافي، وحالات التأخير والغياب</p>
        </div>
      </div>

      <div className="bg-[#1b3325]/60 border border-[#d4af37]/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="p-4">اسم الموظف</th>
                <th className="p-4">وقت الدخول</th>
                <th className="p-4">وقت الخروج</th>
                <th className="p-4">موقع البصمة</th>
                <th className="p-4">ساعات العمل</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#d4af37]/5 transition">
                  <td className="p-4 font-bold">{rec.employee_name}</td>
                  <td className="p-4 font-mono text-emerald-400">{rec.check_in}</td>
                  <td className="p-4 font-mono text-amber-400">{rec.check_out || '-'}</td>
                  <td className="p-4 text-slate-300">{rec.location || 'Fayha Branch'}</td>
                  <td className="p-4 font-mono text-[#d4af37]">{rec.work_hours || '8.5 س'}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
