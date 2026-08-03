import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { CorrectionRequestItem } from '../types/attendance.types';

export const AttendanceApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<CorrectionRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getCorrections();
      setRequests(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm('هل أنت تأكد من اعتماد طلب تصحيح البصمة؟')) return;
    try {
      await attendanceService.approveCorrection(id);
      alert('تم اعتماد طلب التصحيح بنجاح');
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'فشل اعتماد الطلب');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('هل أنت تأكد من رفض طلب التصحيح؟')) return;
    try {
      await attendanceService.rejectCorrection(id);
      alert('تم رفض الطلب بنجاح');
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'فشل رفض الطلب');
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="bg-[#1b3325]/90 p-6 rounded-2xl border border-[#d4af37]/30 shadow-2xl">
        <h2 className="text-xl font-bold text-[#d4af37]">وورك فلو طلبات وموافقات تصحيح البصمات (Workflow Engine)</h2>
        <p className="text-xs text-slate-400 mt-1">اعتماد أو رفض طلبات تعديل وقت البصمة والعمل عن بعد مخصومة ومعتمدة في السجل</p>
      </div>

      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
            <tr>
              <th className="p-4">اسم الموظف</th>
              <th className="p-4">نوع الطلب</th>
              <th className="p-4">السبب</th>
              <th className="p-4">الوقت المطلوب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-center">إجراءات الاعتماد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-[#d4af37]/5 transition">
                <td className="p-4 font-bold">{req.employee_name} ({req.empNo})</td>
                <td className="p-4 text-slate-300">{req.request_type}</td>
                <td className="p-4 text-slate-400 text-xs">{req.reason}</td>
                <td className="p-4 font-mono text-[#d4af37] font-bold">{req.requested_time}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold">
                    {req.approval_status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 bg-emerald-700/60 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-semibold hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                    >
                      ✓ موافقة
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1 bg-red-800/60 text-red-200 border border-red-500/40 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition cursor-pointer"
                    >
                      ✕ رفض
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
