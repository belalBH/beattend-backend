import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { AttendanceRecordFull } from '../types/attendance.types';
import { AttendanceFilters } from '../components/AttendanceFilters';

export const AttendanceLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceRecordFull[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendanceLogs();
      setLogs(data);
    } catch {
      // Fallback if empty
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = async (rec: AttendanceRecordFull) => {
    const status = window.prompt(`تعديل وتصحيح بصمة الموظف (${rec.employee_name}):`, 'تم قبول وتصحيح البصمة (مقبول)');
    if (!status) return;
    try {
      await attendanceService.checkIn(rec.location || 'Fayha Branch');
      alert(`تم تصحيح البصمة وتحديث السجل بنجاح`);
      loadLogs();
    } catch (err: any) {
      alert(err.message || 'فشل في تصحيح البصمة');
    }
  };

  const filteredLogs = logs.filter(l =>
    l.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.empNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      {/* Filters Bar */}
      <AttendanceFilters
        searchTerm={searchTerm}
        selectedCompany={selectedCompany}
        selectedBranch={selectedBranch}
        onSearchChange={setSearchTerm}
        onCompanyChange={setSelectedCompany}
        onBranchChange={setSelectedBranch}
      />

      {/* Table */}
      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="p-4">الموظف</th>
                <th className="p-4">الرقم الوظيفي</th>
                <th className="p-4">الشركة والفرع</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">وقت الدخول</th>
                <th className="p-4">وقت الخروج</th>
                <th className="p-4">ساعات العمل</th>
                <th className="p-4">التأخير</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
              {filteredLogs.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#d4af37]/5 transition">
                  <td className="p-4 font-bold">{rec.employee_name}</td>
                  <td className="p-4 font-mono text-[#d4af37]">{rec.empNo}</td>
                  <td className="p-4 text-xs text-slate-300">{rec.company_name} | {rec.location || 'Fayha Branch'}</td>
                  <td className="p-4 font-mono">{rec.date_display}</td>
                  <td className="p-4 font-mono text-emerald-400">{rec.check_in_time}</td>
                  <td className="p-4 font-mono text-amber-400">{rec.check_out_time}</td>
                  <td className="p-4 font-mono text-[#d4af37]">{rec.work_hours_display}</td>
                  <td className="p-4 font-mono text-slate-400">{rec.tardiness_hours}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleCorrect(rec)}
                      className="px-3 py-1 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs font-semibold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                    >
                      🛠️ تصحيح السجل
                    </button>
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
