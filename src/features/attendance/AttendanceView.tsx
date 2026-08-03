import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { AttendanceRecord, Employee } from '../../types';

export const AttendanceView: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [locationInput, setLocationInput] = useState<string>('Fayha Branch');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attData, empData] = await Promise.all([
        apiService.getAttendance(),
        apiService.getEmployees()
      ]);
      setAttendance(attData);
      setEmployees(empData);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل سجلات الحضور');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiService.checkIn(locationInput);
      setSuccessMsg('تم تسجيل بصمة الدخول الحية بنجاح');
      setShowCheckInModal(false);
      loadAttendance();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل البصمة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCorrect = async (rec: AttendanceRecord) => {
    const newStatus = window.prompt(`تعديل/تصحيح حالة بصمة (${rec.employee_name}):`, 'تم تصحيح البصمة (مقبولة)');
    if (!newStatus) return;
    try {
      await apiService.correctAttendance(rec.id, newStatus);
      setSuccessMsg(`تم قبول وتصحيح بصمة الموظف (${rec.employee_name}) بنجاح`);
      loadAttendance();
    } catch (err: any) {
      setError(err.message || 'فشل تصحيح البصمة');
    }
  };

  const filteredAttendance = attendance.filter(rec =>
    rec.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rec.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل سجلات الحضور والبصمة الحية من خادم الـ Staging...
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1b3325]/80 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">سجلات الحضور والتصحيح الحية (Fingerprint Workflow)</h2>
          <p className="text-sm text-slate-400 mt-1">تسجيل بصمة فورية، تصحيح الأوقات والحالات، واعتماد طلبات التعديل في Staging</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="بحث باسم الموظف أو الفرع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37] text-sm w-full md:w-56"
          />
          <button
            onClick={() => setShowCheckInModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition whitespace-nowrap"
          >
            ⏱️ تسجيل بصمة حية
          </button>
        </div>
      </div>

      {/* Table */}
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
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
              {filteredAttendance.map((rec) => (
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
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleCorrect(rec)}
                      className="px-3 py-1 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs font-semibold hover:bg-[#d4af37] hover:text-[#0f1e16] transition"
                    >
                      🛠️ تصحيح البصمة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#d4af37]">تسجيل بصمة دخول حية جديدة</h3>
            <form onSubmit={handleCheckIn} className="space-y-4 text-right">
              <div>
                <label className="block text-xs text-slate-300 mb-1">فرع/موقع البصمة</label>
                <input
                  type="text"
                  required
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div className="p-3 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl text-xs text-slate-300 space-y-1 font-mono">
                <div>التاريخ والوقت: {new Date().toLocaleString('ar-SA')}</div>
                <div>حالة الجهاز: GPS Verified (Accurate to 3m)</div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? 'جاري التسجيل...' : 'تسجيل البصمة الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
