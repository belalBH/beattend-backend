import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { Employee } from '../../types';

export const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل سجلات الموظفين المباشرة من خادم الـ Staging...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-center my-4">
        <p className="font-bold">خطأ في الاتصال بقاعدة البيانات:</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadEmployees} className="mt-4 px-4 py-1.5 bg-[#d4af37] text-[#0f1e16] rounded-lg font-bold hover:bg-[#f3e5ab]">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1b3325]/80 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">دليل الموظفين الرسمي</h2>
          <p className="text-sm text-slate-400 mt-1">عرض والتحكم ببيانات الموظفين، الصلاحيات، والربط مع تطبيق الجوال</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="بحث باسم الموظف أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-[#0f1e16]/80 border border-[#d4af37]/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37] text-sm w-full md:w-64"
          />
          <button className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition whitespace-nowrap">
            + إضافة موظف
          </button>
        </div>
      </div>

      <div className="bg-[#1b3325]/60 border border-[#d4af37]/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="p-4">الرقم الوظيفي</th>
                <th className="p-4">الاسم الكامل</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الشركة / المنشأة</th>
                <th className="p-4">القسم</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#d4af37]/5 transition">
                  <td className="p-4 font-mono text-[#d4af37] font-semibold">{emp.empNo}</td>
                  <td className="p-4 font-bold">{emp.first_name} {emp.last_name}</td>
                  <td className="p-4 font-mono text-slate-300">{emp.email}</td>
                  <td className="p-4">{emp.company_name || 'Solutions Co'}</td>
                  <td className="p-4">{emp.department_name || 'تقنية المعلومات'}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                      نشط
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
