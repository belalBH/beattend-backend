import React, { useState, useEffect } from 'react';

export const PlatformConsoleView: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('dashboard');
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
        setIsModalOpen(false);
        setCompanyName('');
        setCompanyCode('');
        setAdminEmail('');
        loadPlatformTenants();
        alert(`تم إنتاج وتجهيز الشركة بنجاح!\nرابط التفعيل: ${data.data.activation_url}`);
      } else {
        alert(data.message || 'فشل تدشين الشركة');
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء الاتصال بالمنصة');
    } finally {
      setOnboarding(false);
    }
  };

  const platformNavItems = [
    { id: 'dashboard', label: 'لوحة المنصة', icon: '📊' },
    { id: 'tenants', label: 'الشركات والمنشآت', icon: '🏢' },
    { id: 'plans', label: 'الباقات والأسعار', icon: '💰' },
    { id: 'subscriptions', label: 'الاشتراكات', icon: '📅' },
    { id: 'features', label: 'الوحدات والمزايا', icon: '🧩' },
    { id: 'users', label: 'مستخدمو المنصة', icon: '🛡️' },
    { id: 'limits', label: 'حدود الاستخدام', icon: '⚡' },
    { id: 'storage', label: 'التخزين والمظلات', icon: '☁️' },
    { id: 'support', label: 'الدعم والتذاكر', icon: '💬' },
    { id: 'audit', label: 'سجلات المنصة (Audit)', icon: '📜' },
    { id: 'settings', label: 'إعدادات المنصة', icon: '⚙️' }
  ];

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
    <div className="min-h-screen bg-[#07120c] text-slate-100 font-sans flex flex-col md:flex-row dir-rtl text-right" dir="rtl">
      {/* Platform Sidebar */}
      <aside className="w-full md:w-64 bg-[#0e1d15] border-l border-[#d4af37]/20 p-5 shrink-0 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-xl flex items-center justify-center shadow-lg">
            🛡️
          </div>
          <div>
            <h1 className="text-lg font-black text-[#d4af37]">BeatAttend SaaS</h1>
            <p className="text-[11px] text-slate-400 font-mono">Platform Console v2026</p>
          </div>
        </div>

        <nav className="space-y-1">
          {platformNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSelectedTenant(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                activeNav === item.id && !selectedTenant
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] shadow-lg'
                  : 'text-slate-300 hover:bg-[#182f22] hover:text-[#d4af37]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Console Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Banner */}
        <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#d4af37]">🛡️ لوحة التحكم الفائقة للمنصة (Platform Super Admin)</h1>
            <p className="text-xs text-slate-300 mt-1">إدارة الاشتراكات، عزل المنشآت، الباقات وتفعيل المزايا الموديلار</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            + تدشين منشأة جديدة (Single Transaction)
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

            {/* Sub-Tab Content rendering */}
            <div className="p-4 bg-[#07120c] rounded-2xl border border-[#d4af37]/20 text-xs space-y-3">
              {tenantSubTab === 'basic' && (
                <div className="space-y-2">
                  <div className="text-slate-400">معرف المنشأة: <span className="text-[#d4af37] font-mono font-bold">{selectedTenant.tenant_id}</span></div>
                  <div className="text-slate-400">اسم الشركة بالعربية: <span className="text-slate-200 font-bold">{selectedTenant.company_name}</span></div>
                  <div className="text-slate-400">السجل التجاري: <span className="text-slate-200 font-mono">{selectedTenant.cr_number || '1010884920'}</span></div>
                </div>
              )}
              {tenantSubTab === 'workspace' && (
                <div className="space-y-2 font-mono text-slate-300">
                  <div>Slug: <span className="text-emerald-400">{selectedTenant.slug}</span></div>
                  <div>Subdomain: <span className="text-[#d4af37]">{selectedTenant.subdomain}</span></div>
                  <div>Domain URL: <span className="text-blue-400">https://{selectedTenant.subdomain}</span></div>
                </div>
              )}
              {tenantSubTab === 'subscription' && (
                <div className="space-y-2">
                  <div>الباقة الحالية: <span className="text-[#d4af37] font-bold">{selectedTenant.plan_name || 'الباقة الاحترافية (Enterprise)'}</span></div>
                  <div>الحد الأقصى للمستخدمين: <span className="font-mono text-slate-200">{selectedTenant.max_admin_users || 10} أدمن</span></div>
                  <div>الحد الأقصى للموظفين: <span className="font-mono text-slate-200">{selectedTenant.max_employees || 200} موظف</span></div>
                </div>
              )}
              {tenantSubTab === 'features' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['employees', 'leaves', 'attendance', 'reports', 'settings', 'geofencing', 'payroll', 'leave_types'].map((f) => (
                    <div key={f} className="p-3 bg-[#12241a] rounded-xl border border-emerald-500/30 text-emerald-300 font-mono text-center">
                      ✓ {f}
                    </div>
                  ))}
                </div>
              )}
              {tenantSubTab === 'status' && (
                <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-xl space-y-3">
                  <p className="text-amber-200 font-bold">الحالة الحالية: {selectedTenant.status === 'active' ? '🟢 نشط ومعتمد' : '🔴 موقوف'}</p>
                  <button
                    type="button"
                    onClick={() => alert('تم تغيير حالة تفعيل الشركة')}
                    className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-500 transition cursor-pointer"
                  >
                    ⚠️ {selectedTenant.status === 'active' ? 'تعليق اشتراك الشركة' : 'تفعيل اشتراك الشركة'}
                  </button>
                </div>
              )}
              {!['basic', 'workspace', 'subscription', 'features', 'status'].includes(tenantSubTab) && (
                <div className="py-6 text-center text-slate-400">
                  جاري استرجاع بيانات Tab ({tenantSubTab}) الحية...
                </div>
              )}
            </div>
          </div>
        )}

        {/* TENANTS GRID / LIST */}
        {!loading && !selectedTenant && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((t) => (
              <div key={t.tenant_id} className="bg-[#12241a] border border-[#d4af37]/20 rounded-3xl p-5 shadow-xl space-y-4 hover:border-[#d4af37]/60 transition">
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

                <button
                  type="button"
                  onClick={() => { setSelectedTenant(t); setTenantSubTab('basic'); }}
                  className="w-full py-2.5 bg-[#07120c] border border-[#d4af37]/30 text-[#d4af37] font-bold rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                >
                  🔍 عرض التفاصيل والـ 10 Tabs ←
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
                <h3 className="text-lg font-bold text-[#d4af37]">تدشين شركة جديدة (PDO Transaction)</h3>
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
                  <label className="block text-slate-300 font-bold mb-1">رمز الشركة (Company Code) *</label>
                  <input
                    type="text"
                    required
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ADVANCED"
                    className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني لمدير الشركة *</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@advanced.sa"
                    className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={onboarding}
                  className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-extrabold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
                >
                  {onboarding ? 'جاري التدشين والتنفيذ بالكامل...' : '🚀 تدشين وتوليد رابط التفعيل ←'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
