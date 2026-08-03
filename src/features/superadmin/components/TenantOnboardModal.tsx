import React, { useState } from 'react';
import { TenantOnboardInput } from '../types/superadmin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOnboard: (data: TenantOnboardInput) => Promise<void>;
}

export const TenantOnboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOnboard
}) => {
  const [formData, setFormData] = useState<TenantOnboardInput>({
    company_name: '',
    company_code: '',
    admin_email: '',
    plan_id: 2
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.company_code || !formData.admin_email) {
      setError('اسم الشركة، رمز الشركة، وبريد الأدمن حقول إجبارية');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onOnboard(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل إضافة وإعداد المنشأة الجديدة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
      <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
          <h2 className="text-xl font-bold text-[#d4af37]">🏢 إضافة وتدشين منشأة جديدة (SaaS Onboarding)</h2>
          <button type="button" onClick={onClose} className="text-slate-400 font-bold hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
          <div>
            <label className="block text-slate-300 font-bold mb-1">اسم الشركة / المنشأة *</label>
            <input
              type="text"
              required
              value={formData.company_name}
              onChange={(e) => setFormData(p => ({ ...p, company_name: e.target.value }))}
              placeholder="مثال: شركة الابتكار المالي"
              className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">رمز الشركة (Company Code / Subdomain) *</label>
            <input
              type="text"
              required
              value={formData.company_code}
              onChange={(e) => setFormData(p => ({ ...p, company_code: e.target.value.toUpperCase() }))}
              placeholder="مثال: INNOVATE"
              className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono uppercase focus:outline-none focus:border-[#d4af37]"
            />
            <p className="text-[10px] text-slate-400 mt-1">سيتم توليد الدومين الفرعي تلقائياً: <span className="text-[#d4af37] font-mono">{formData.company_code ? formData.company_code.toLowerCase() : 'code'}.beattend.com</span></p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني لمدير الشركة (Company Admin Email) *</label>
            <input
              type="email"
              required
              value={formData.admin_email}
              onChange={(e) => setFormData(p => ({ ...p, admin_email: e.target.value }))}
              placeholder="admin@innovate.sa"
              className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">باقة الاشتراك المخصصة</label>
            <select
              value={formData.plan_id}
              onChange={(e) => setFormData(p => ({ ...p, plan_id: parseInt(e.target.value) || 2 }))}
              className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              <option value={1}>الباقة المبتدئة (Basic) - 25 موظف | 2 مدراء</option>
              <option value={2}>الباقة المؤسسية (Enterprise) - 200 موظف | 10 مدراء</option>
              <option value={3}>الباقة الغير محدودة (Unlimited) - 5000 موظف | 100 مدير</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#d4af37]/20">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              {submitting ? 'جاري تهيئة الـ Subdomain والتسجيل...' : '🚀 تدشين المنشأة وإنشاء Tenant ID'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-[#0f1e16] text-slate-300 border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:text-[#d4af37] transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
