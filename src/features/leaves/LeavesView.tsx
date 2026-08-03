import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { LeaveRequest } from '../../types';

export const LeavesView: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getLeaves();
      setLeaves(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل طلبات الإجازات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل الطلبات والرصيد من خادم الـ Staging...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-center my-4">
        <p className="font-bold">خطأ في الاتصال بالشبكة:</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadLeaves} className="mt-4 px-4 py-1.5 bg-[#d4af37] text-[#0f1e16] rounded-lg font-bold hover:bg-[#f3e5ab]">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1b3325]/80 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">إدارة الإجازات والطلبات</h2>
          <p className="text-sm text-slate-400 mt-1">عرض طلبات الإجازات المعلقة، أرصدة الموظفين، والموافقات المعتمدة</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition">
          + طلب إجازة جديدة
        </button>
      </div>

      <div className="bg-[#1b3325]/60 border border-[#d4af37]/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="p-4">اسم الموظف</th>
                <th className="p-4">نوع الإجازة</th>
                <th className="p-4">تاريخ البدء</th>
                <th className="p-4">تاريخ الانتهاء</th>
                <th className="p-4">المدة (أيام)</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
              {leaves.map((req) => (
                <tr key={req.id} className="hover:bg-[#d4af37]/5 transition">
                  <td className="p-4 font-bold">{req.employee_name}</td>
                  <td className="p-4 text-slate-300">{req.type}</td>
                  <td className="p-4 font-mono">{req.start_date}</td>
                  <td className="p-4 font-mono">{req.end_date}</td>
                  <td className="p-4 font-mono text-[#d4af37] font-bold">{req.days_count} يوم</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
                      {req.status}
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
