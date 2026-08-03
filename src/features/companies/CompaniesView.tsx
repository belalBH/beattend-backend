import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { Company } from '../../types';

export const CompaniesView: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name: '',
    cr_number: '',
    tax_number: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCompanies();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات الشركات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({ name_ar: '', name: '', cr_number: '', tax_number: '', is_active: true });
    setShowModal(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      name_ar: comp.name_ar,
      name: comp.name,
      cr_number: comp.cr_number || '',
      tax_number: comp.tax_number || '',
      is_active: comp.is_active
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (comp: Company) => {
    if (!window.confirm(`هل أنت تأكد من تغيير حالة شركة (${comp.name_ar})؟`)) return;
    try {
      await apiService.updateCompany(comp.id, { is_active: !comp.is_active });
      setSuccessMsg(`تم تغيير حالة شركة (${comp.name_ar}) بنجاح`);
      loadCompanies();
    } catch (err: any) {
      setError(err.message || 'فشل في تعديل الحالة');
    }
  };

  const handleDelete = async (comp: Company) => {
    if (!window.confirm(`⚠️ حظر نهائي: هل أنت تأكد من حذف شركة (${comp.name_ar})؟`)) return;
    try {
      await apiService.deleteCompany(comp.id);
      setSuccessMsg(`تم حذف شركة (${comp.name_ar}) بنجاح`);
      loadCompanies();
    } catch (err: any) {
      setError(err.message || 'فشل حذف الشركة');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar) {
      setError('اسم الشركة بالعربية حقل إجباري');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingCompany) {
        await apiService.updateCompany(editingCompany.id, formData);
        setSuccessMsg(`تم تحديث شركة (${formData.name_ar}) بنجاح`);
      } else {
        await apiService.createCompany(formData);
        setSuccessMsg(`تم إضافة شركة (${formData.name_ar}) بنجاح`);
      }
      setShowModal(false);
      loadCompanies();
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل بيانات الشركات من خادم الـ Staging...
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

      {/* Page Header */}
      <div className="flex justify-between items-center bg-[#1b3325]/80 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">إدارة الشركات والفروع (Interactive CRUD)</h2>
          <p className="text-sm text-slate-400 mt-1">إضافة، تعديل، تعطيل، وحذف المنشآت المعتمدة حياً في قاعدة بيانات الـ Staging</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition"
        >
          + إضافة شركة جديدة
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-[#1b3325]/60 border border-[#d4af37]/20 rounded-2xl p-6 hover:border-[#d4af37]/60 transition shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{company.name_ar}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{company.name}</p>
                </div>
                <button
                  onClick={() => handleToggleStatus(company)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${company.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}
                >
                  {company.is_active ? 'نشطة' : 'متوقفة'}
                </button>
              </div>
              <div className="space-y-2 text-sm text-slate-300 border-t border-[#d4af37]/10 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">السجل التجاري:</span>
                  <span className="font-mono text-[#d4af37]">{company.cr_number || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الرقم الضريبي:</span>
                  <span className="font-mono text-[#d4af37]">{company.tax_number || '-'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#d4af37]/10 pt-4 mt-6">
              <button
                onClick={() => handleOpenEdit(company)}
                className="flex-1 py-1.5 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-lg font-semibold text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition"
              >
                ✏️ تعديل
              </button>
              <button
                onClick={() => handleDelete(company)}
                className="px-3 py-1.5 bg-red-900/30 text-red-300 border border-red-500/30 rounded-lg font-semibold text-xs hover:bg-red-600 hover:text-white transition"
              >
                🗑️ حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#d4af37]">
              {editingCompany ? 'تعديل بيانات الشركة' : 'إضافة شركة جديدة'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs text-slate-300 mb-1">اسم الشركة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">اسم الشركة بالإنجليزية</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">السجل التجاري</label>
                  <input
                    type="text"
                    value={formData.cr_number}
                    onChange={(e) => setFormData({ ...formData, cr_number: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={formData.tax_number}
                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="compActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#d4af37]"
                />
                <label htmlFor="compActive" className="text-sm text-slate-200 cursor-pointer">شركة نشطة في النظام</label>
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
                  {submitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
