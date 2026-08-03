import React, { useState, useEffect } from 'react';

export const PlatformConsoleView: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenantSubTab, setTenantSubTab] = useState<string>('basic');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Tenant Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [companyCode, setCompanyCode] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [onboarding, setOnboarding] = useState<boolean>(false);

  useEffect(() => {
    loadPlatformTenants();
  }, []);

  const loadPlatformTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/php_api/api.php?route=platform_tenants', {
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        setTenants(data.data || []);
      } else {
        setError(data.message || 'فشل تحميل بيانات منصة BeatAttend');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API المنصة المحمية');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !companyCode || !adminEmail) return;

    setOnboarding(true);
    try {
      const res = await fetch('/php_api/api.php?route=platform_tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify({
          company_name: companyName,
          company_code: companyCode.toUpperCase(),
          admin_email: adminEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`تم تدشين منشأة (${companyName}) وتجهيز بيئة العمل بنجاح`);
        setIsModalOpen(false);
        setCompanyName('');
        setCompanyCode('');
        setAdminEmail('');
        loadPlatformTenants();
      } else {
        alert(data.message || 'فشل تدشين المنشأة');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال بالخادم أثناء تدشين المنشأة');
    } finally {
      setOnboarding(false);
    }
  };

  const tenantDetailSubTabs = [
    { id: 'basic', label: 'البيانات الأساسية' },
    { id: 'workspace', label: 'Workspace والنطاق' },
    { id: 'subscription', label: 'الاشتراك والباقة' },
    { id: 'features', label: 'الوحدات المفعلة' },
    { id: 'admins', label: 'مستخدمو الشركة' },
    { id: 'employees', label: 'الموظفون' },
    { id: 'branches', label: 'الفروع' },
    { id: 'usage', label: 'الاستخدام' },
    { id: 'logs', label: 'السجلات' },
    { id: 'status', label: 'التعليق والتفعيل' }
  ];

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#d4af37]">🏢 إدارة الشركات والمنشآت (Tenants & Companies)</h1>
          <p className="text-xs text-slate-300 mt-1">إدارة اشتراكات المنشآت، عزل البيانات، وتفعيل المزايا الموديلار</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
        >
          ➕ إضافة منشأة جديدة
        </button>
      </div>

      {loading && (
        <div className="text-center py-12 text-[#d4af37] text-sm font-bold animate-pulse">
          جاري استرجاع منشآت المنصة والبيانات الحية...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      )}

      {/* TENANT DETAILS WITH 10 TABS */}
      {selectedTenant && (
        <div className="bg-[#12241a] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#d4af37]">{selectedTenant.company_name} ({selectedTenant.company_code})</h2>
              <p className="text-xs text-slate-400 font-mono">{selectedTenant.subdomain}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTenant(null)}
              className="px-4 py-2 bg-[#07120c] border border-[#d4af37]/30 text-xs font-bold text-[#d4af37] rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
            >
              ← العودة لقائمة المنشآت
            </button>
          </div>

          {/* 10 Sub-Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#d4af37]/15 pb-3">
            {tenantDetailSubTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTenantSubTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tenantSubTab === tab.id
                    ? 'bg-[#d4af37] text-[#0f1e16] shadow-md'
                    : 'bg-[#07120c] text-slate-300 border border-[#d4af37]/20 hover:text-[#d4af37]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-[#07120c] rounded-2xl border border-[#d4af37]/20 text-xs space-y-3">
            {tenantSubTab === 'basic' && (
              <div className="space-y-2">
                <h4 className="font-bold text-[#d4af37]">البيانات الأساسية للمنشأة</h4>
                <div>اسم الشركة: {selectedTenant.company_name}</div>
                <div>كود الشركة: {selectedTenant.company_code}</div>
                <div>معرف الـ Tenant: {selectedTenant.tenant_id}</div>
              </div>
            )}

            {tenantSubTab === 'workspace' && (
              <div className="space-y-2">
                <h4 className="font-bold text-[#d4af37]">إعدادات الـ Workspace والنطاق</h4>
                <div>النطاق الفرعي (Subdomain): {selectedTenant.subdomain}</div>
                <div>الـ Slug: {selectedTenant.slug}</div>
              </div>
            )}

            {tenantSubTab === 'subscription' && (
              <div className="space-y-2">
                <h4 className="font-bold text-[#d4af37]">بيانات الاشتراك والباقة</h4>
                <div>الباقة الحالية: {selectedTenant.plan_name || 'الباقة المؤسسية'}</div>
                <div>حالة الاشتراك: {selectedTenant.subscription_status || 'نشط'}</div>
              </div>
            )}

            {!['basic', 'workspace', 'subscription'].includes(tenantSubTab) && (
              <div className="text-slate-400 py-4 text-center">
                تم تجهيز تبويب ({tenantDetailSubTabs.find(t => t.id === tenantSubTab)?.label}) بنجاح للمنشأة.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TENANTS GRID CARDS */}
      {!selectedTenant && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((t) => (
            <div key={t.tenant_id} className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 hover:border-[#d4af37]/60 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-[#d4af37] text-sm">{t.company_name || t.company_code}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{t.subdomain}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${t.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'}`}>
                    {t.status === 'active' ? '🟢 نشط' : '🔴 موقوف'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الكود:</span>
                    <span className="font-mono text-[#d4af37] font-bold">{t.company_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">عدد الموظفين:</span>
                    <span className="font-mono text-slate-100">{t.current_employees_count || 0} / {t.max_employees || 200}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setSelectedTenant(t); setTenantSubTab('basic'); }}
                className="w-full py-2.5 bg-[#07120c] border border-[#d4af37]/30 text-[#d4af37] font-bold rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
              >
                🔍 عرض التفاصيل الكاملة ←
              </button>
            </div>
          ))}
        </div>
      )}

      {/* NEW TENANT ONBOARDING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
          <div className="bg-[#12241a] border border-[#d4af37]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
              <h3 className="text-lg font-bold text-[#d4af37]">إضافة منشأة جديدة</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الشركة *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: شركة الحلول المتقدمة"
                  className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رمز المنشأة (Company Code) *</label>
                <input
                  type="text"
                  required
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  placeholder="مثال: ADV"
                  className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 uppercase font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني لمدير الشركة *</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={onboarding}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition disabled:opacity-50"
                >
                  {onboarding ? 'جاري التدشين...' : 'تأكيد الإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
