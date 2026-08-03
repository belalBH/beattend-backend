import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { Employee, Company } from '../../types';
import { EmployeeEditModal } from './EmployeeEditModal';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';

export const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Modals & Page Navigation State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    empNo: '',
    company_id: 1,
    is_active: true
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empData, compData] = await Promise.all([
        apiService.getEmployees(),
        apiService.getCompanies()
      ]);
      setEmployees(empData);
      setCompanies(compData);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingEmployeeId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      empNo: 'EMP-STG-' + Math.floor(100 + Math.random() * 900),
      company_id: companies[0]?.id || 1,
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
  };

  const handleOpenFullProfile = (emp: Employee) => {
    setViewingProfileId(emp.id);
  };

  const handleToggleStatus = async (emp: Employee) => {
    if (!window.confirm(`هل أنت تأكد من تغيير حالة الموظف (${emp.first_name} ${emp.last_name})؟`)) return;
    try {
      await apiService.updateEmployee(emp.id, { is_active: emp.status !== 'active' });
      setSuccessMsg(`تم تغيير حالة الموظف (${emp.first_name} ${emp.last_name}) بنجاح`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل تعديل حالة الموظف');
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!window.confirm(`⚠️ حظر نهائي: هل أنت تأكد من حذف الموظف (${emp.first_name} ${emp.last_name})؟`)) return;
    try {
      await apiService.deleteEmployee(emp.id);
      setSuccessMsg(`تم حذف الموظف (${emp.first_name} ${emp.last_name}) بنجاح`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل حذف الموظف');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('الاسم والبريد الإلكتروني حقول إجبارية');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiService.createEmployee(formData);
      setSuccessMsg(`تم إضافة الموظف (${formData.first_name} ${formData.last_name}) بنجاح`);
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'فشل إضافة الموظف');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !selectedCompanyId || String(emp.company_id) === selectedCompanyId;
    return matchesSearch && matchesCompany;
  });

  if (viewingProfileId !== null) {
    return (
      <EmployeeProfilePage
        employeeId={viewingProfileId}
        onBack={() => {
          setViewingProfileId(null);
          loadData();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل دليل الموظفين من خادم الـ Staging...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 bg-emerald-900/60 border border-emerald-500 rounded-xl text-emerald-200 flex justify-between items-center shadow-lg">
          <span>✅ {successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold px-2">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-900/60 border border-red-500 rounded-xl text-red-200 flex justify-between items-center shadow-lg">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 font-bold px-2">✕</button>
        </div>
      )}

      {/* Page Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1b3325]/90 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">دليل الموظفين الرسمي (Full Interactive Profile Page)</h2>
          <p className="text-sm text-slate-400 mt-1">اضغط على اسم أي موظف أو زر الملف الكامل لفتح صفحة التعديل الشاملة بالأبواب الـ 12</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="px-3 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-[#d4af37]"
          >
            <option value="">جميع الشركات</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name_ar}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#d4af37] text-sm w-full md:w-56"
          />
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition cursor-pointer whitespace-nowrap relative z-20"
          >
            + إضافة موظف
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
              <tr>
                <th className="p-4">الرقم الوظيفي</th>
                <th className="p-4">الاسم الكامل</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">الشركة</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">إجراءات الملف والتعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#d4af37]/5 transition">
                  <td className="p-4 font-mono text-[#d4af37] font-semibold">{emp.empNo}</td>
                  <td className="p-4 font-bold">
                    <button
                      type="button"
                      onClick={() => handleOpenFullProfile(emp)}
                      className="text-slate-100 hover:text-[#d4af37] hover:underline font-bold text-right cursor-pointer"
                    >
                      {emp.first_name} {emp.last_name}
                    </button>
                  </td>
                  <td className="p-4 font-mono text-slate-300">{emp.email}</td>
                  <td className="p-4 font-mono text-slate-400">{emp.phone || '-'}</td>
                  <td className="p-4">{emp.company_name || 'Solutions Co'}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(emp)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${emp.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}
                    >
                      {emp.status === 'active' ? 'نشط' : 'تعطيل'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenFullProfile(emp)}
                        className="px-3 py-1 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-lg text-xs hover:brightness-110 transition cursor-pointer"
                      >
                        👤 صفحة الملف الكاملة
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(emp)}
                        className="px-3 py-1 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs font-semibold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                      >
                        ✏️ تعديل سريع
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(emp)}
                        className="px-3 py-1 bg-red-900/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition cursor-pointer"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Tab Employee Edit Modal */}
      {editingEmployeeId && (
        <EmployeeEditModal
          employeeId={editingEmployeeId}
          onClose={() => setEditingEmployeeId(null)}
          onSaved={() => {
            loadData();
            setSuccessMsg('تم تحديث بيانات الموظف بنجاح في قاعدة بيانات الـ Staging');
          }}
        />
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1b3325] border border-[#d4af37]/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#d4af37]">إضافة موظف جديد</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">الاسم الأول *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">الاسم الأخير *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">الرقم الوظيفي</label>
                  <input
                    type="text"
                    value={formData.empNo}
                    onChange={(e) => setFormData({ ...formData, empNo: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">رقم الجوال</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">الشركة التابع لها</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
