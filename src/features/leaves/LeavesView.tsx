import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { LeaveRequest, Employee } from '../../types';

export const LeavesView: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    employee_id: 1,
    leave_type_id: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    days_count: 3,
    reason: 'إجازة سنوية'
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leavesData, empData] = await Promise.all([
        apiService.getLeaves(),
        apiService.getEmployees()
      ]);
      setLeaves(leavesData);
      setEmployees(empData);
      if (empData.length > 0) {
        setFormData(prev => ({ ...prev, employee_id: empData[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'فشل تحميل بيانات الإجازات');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: LeaveRequest) => {
    if (!window.confirm(`هل أنت تأكد من اعتماد موافقة إجازة (${req.employee_name}) خصماً من الرصيد؟`)) return;
    try {
      await apiService.approveLeave(req.id);
      setSuccessMsg(`تم اعتماد إجازة (${req.employee_name}) وتحديث الرصيد بنجاح`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل قبول الإجازة');
    }
  };

  const handleReject = async (req: LeaveRequest) => {
    const reason = window.prompt(`سبب رفض إجازة (${req.employee_name}):`, 'عدم كفاية الرصيد / حاجة العمل');
    if (reason === null) return;
    try {
      await apiService.rejectLeave(req.id, reason);
      setSuccessMsg(`تم رفض طلب إجازة (${req.employee_name}) بنجاح`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل رفض الإجازة');
    }
  };

  const handleCancel = async (req: LeaveRequest) => {
    if (!window.confirm(`هل أنت تأكد من إلغاء طلب إجازة (${req.employee_name})؟`)) return;
    try {
      await apiService.cancelLeave(req.id);
      setSuccessMsg(`تم إلغاء طلب الإجازة بنجاح`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل إلغاء الإجازة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiService.createLeave(formData);
      setSuccessMsg('تم تقديم طلب الإجازة بنجاح وإدراجه في قائمة الانتظار');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل تقديم طلب الإجازة');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل طلبات الإجازات وورك فلو الموافقات من سيرفر الـ Staging...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 bg-emerald-900/40 border border-emerald-500/40 rounded-xl text-emerald-300 flex justify-between items-center">
          <span>✅ {successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-900/40 border border-red-500/40 rounded-xl text-red-300 flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 font-bold">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-[#1b3325]/80 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">إدارة وورك فلو الإجازات (Workflow Approval)</h2>
          <p className="text-sm text-slate-400 mt-1">إنشاء طلب جديد، اعتماد الإجازة وخصم الرصيد، الرفض مسبباً، أو الإلغاء الفوري</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition"
        >
          + طلب إجازة جديدة
        </button>
      </div>

      {/* Table */}
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
                <th className="p-4">الحالة الحالية</th>
                <th className="p-4 text-center">إجراءات الاعتماد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
              {leaves.map((req) => (
                <tr key={req.id} className="hover:bg-[#d4af37]/5 transition">
                  <td className="p-4 font-bold">{req.employee_name}</td>
                  <td className="p-4 text-slate-300">{req.type || 'إجازة سنوية'}</td>
                  <td className="p-4 font-mono">{req.start_date}</td>
                  <td className="p-4 font-mono">{req.end_date}</td>
                  <td className="p-4 font-mono text-[#d4af37] font-bold">{req.days_count} يوم</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      req.status === 'مقبولة' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      req.status === 'مرفوضة' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      req.status === 'ملغاة' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {req.status === 'بانتظار موافقة المدير' ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleApprove(req)}
                          className="px-3 py-1 bg-emerald-700/60 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-semibold hover:bg-emerald-600 hover:text-white transition"
                        >
                          ✓ اعتماد
                        </button>
                        <button
                          onClick={() => handleReject(req)}
                          className="px-3 py-1 bg-red-800/60 text-red-200 border border-red-500/40 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition"
                        >
                          ✕ رفض
                        </button>
                        <button
                          onClick={() => handleCancel(req)}
                          className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-600 rounded-lg text-xs hover:bg-slate-700"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">مكتمل</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#d4af37]">تقديم طلب إجازة جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs text-slate-300 mb-1">الموظف صاحب الطلب *</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.empNo})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">تاريخ البدء *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">تاريخ الانتهاء *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">عدد الأيام المطلوب</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.days_count}
                  onChange={(e) => setFormData({ ...formData, days_count: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">سبب الإجازة والدروس الإضافية</label>
                <textarea
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'جاري التقديم...' : 'تقديم الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
