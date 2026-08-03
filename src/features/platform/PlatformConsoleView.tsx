import React, { useState, useEffect } from 'react';

export const PlatformConsoleView: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenantDetailData, setTenantDetailData] = useState<any | null>(null);
  const [tenantSubTab, setTenantSubTab] = useState<string>('basic');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Tenant Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [companyCode, setCompanyCode] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [onboarding, setOnboarding] = useState<boolean>(false);

  // Edit Tenant Form State
  const [editCompanyName, setEditCompanyName] = useState<string>('');
  const [editCrNumber, setEditCrNumber] = useState<string>('');
  const [editTaxNumber, setEditTaxNumber] = useState<string>('');
  const [savingBasic, setSavingBasic] = useState<boolean>(false);

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

  const loadTenantDetails = async (t: any) => {
    setSelectedTenant(t);
    setTenantSubTab('basic');
    setEditCompanyName(t.company_name || '');
    setEditCrNumber(t.cr_number || '');
    setEditTaxNumber(t.tax_number || '');

    try {
      const res = await fetch(`/php_api/api.php?route=platform_tenants&action=detail&tenant_id=${t.tenant_id}`, {
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        setTenantDetailData(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load tenant detail:', err);
    }
  };

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setSavingBasic(true);
    try {
      const res = await fetch('/php_api/api.php?route=platform_tenants&action=basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify({
          tenant_id: selectedTenant.tenant_id,
          company_name: editCompanyName,
          cr_number: editCrNumber,
          tax_number: editTaxNumber
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم تحديث البيانات الأساسية بنجاح');
        loadPlatformTenants();
      } else {
        alert(data.message || 'فشل تحديث البيانات الأساسية');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال أثناء تحديث البيانات الأساسية');
    } finally {
      setSavingBasic(false);
    }
  };

  const handleToggleStatus = async (newStatus: 'active' | 'suspended') => {
    if (!selectedTenant) return;
    const actionName = newStatus === 'suspended' ? 'تعليق' : 'إعادة تفعيل';
    if (!window.confirm(`هل أنت تأكد من ${actionName} منشأة (${selectedTenant.company_name})؟`)) return;

    try {
      const res = await fetch('/php_api/api.php?route=platform_tenants&action=status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify({
          tenant_id: selectedTenant.tenant_id,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`تم ${actionName} المنشأة بنجاح`);
        setSelectedTenant({ ...selectedTenant, status: newStatus });
        loadPlatformTenants();
      } else {
        alert(data.message || 'فشل تغيير حالة المنشأة');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال أثناء تغيير حالة المنشأة');
    }
  };

  const handleRenewSubscription = async () => {
    if (!selectedTenant) return;
    if (!window.confirm(`هل أنت تأكد من تجديد اشتراك منشأة (${selectedTenant.company_name}) لمدة 12 شهر إضافية؟`)) return;

    try {
      const res = await fetch('/php_api/api.php?route=platform_tenants&action=renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify({
          tenant_id: selectedTenant.tenant_id,
          plan_id: selectedTenant.plan_id || 2,
          add_months: 12
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم تجديد اشتراك المنشأة وتمديد الصلاحية لـ 12 شهر بنجاح');
        loadPlatformTenants();
      } else {
        alert(data.message || 'فشل تجديد الاشتراك');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال أثناء تجديد الاشتراك');
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
    { id: 'usage', label: 'الاستخدام والتخزين' },
    { id: 'logs', label: 'السجلات' },
    { id: 'status', label: 'التعليق والتفعيل' }
  ];

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#d4af37]">🏢 إدارة الشركات والمنشآت (Tenants & Companies)</h1>
          <p className="text-xs text-slate-300 mt-1">التعديل الكامل على البيانات، تجديد الاشتراكات، تفعيل المزايا، وتغيير حالات المنشآت</p>
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

      {/* TENANT DETAILS WITH 10 INTERACTIVE TABS */}
      {selectedTenant && (
        <div className="bg-[#12241a] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#d4af37]">{selectedTenant.company_name} ({selectedTenant.company_code})</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${selectedTenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {selectedTenant.status === 'active' ? '🟢 نشط' : '🔴 موقوف'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">{selectedTenant.subdomain} | ID: {selectedTenant.tenant_id}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTenant(null)}
              className="px-4 py-2 bg-[#07120c] border border-[#d4af37]/30 text-xs font-bold text-[#d4af37] rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
            >
              ← العودة لقائمة المنشآت
            </button>
          </div>

          {/* 10 Interactive Sub-Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#d4af37]/15 pb-3">
            {tenantDetailSubTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTenantSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tenantSubTab === tab.id
                    ? 'bg-[#d4af37] text-[#0f1e16] shadow-md'
                    : 'bg-[#07120c] text-slate-300 border border-[#d4af37]/20 hover:text-[#d4af37]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: BASIC INFO EDITING FORM */}
          {tenantSubTab === 'basic' && (
            <form onSubmit={handleSaveBasicInfo} className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">تعديل البيانات الأساسية للشركة</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">اسم الشركة (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full p-2.5 bg-[#12241a] border border-[#d4af37]/30 rounded-xl text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">رقم السجل التجاري (CR Number)</label>
                  <input
                    type="text"
                    value={editCrNumber}
                    onChange={(e) => setEditCrNumber(e.target.value)}
                    className="w-full p-2.5 bg-[#12241a] border border-[#d4af37]/30 rounded-xl text-white font-mono outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الرقم الضريبي (VAT Number)</label>
                  <input
                    type="text"
                    value={editTaxNumber}
                    onChange={(e) => setEditTaxNumber(e.target.value)}
                    className="w-full p-2.5 bg-[#12241a] border border-[#d4af37]/30 rounded-xl text-white font-mono outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingBasic}
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 cursor-pointer"
                >
                  {savingBasic ? 'جاري الحفظ...' : '💾 حفظ التعديلات الأساسية'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: WORKSPACE & DOMAIN */}
          {tenantSubTab === 'workspace' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">إعدادات الـ Workspace والنطاق الفرعي</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">النطاق الفرعي المحجوز (Subdomain)</label>
                  <div className="p-3 bg-[#12241a] border border-[#d4af37]/30 rounded-xl font-mono text-[#d4af37] font-bold">
                    https://{selectedTenant.subdomain}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">معرف المنشأة الفريد (Tenant Code / Slug)</label>
                  <div className="p-3 bg-[#12241a] border border-[#d4af37]/30 rounded-xl font-mono text-slate-200">
                    {selectedTenant.company_code} ({selectedTenant.slug})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTION & RENEWAL */}
          {tenantSubTab === 'subscription' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#d4af37] text-sm">تفاصيل الباقة وتجديد الاشتراك</h4>
                  <p className="text-slate-400 mt-1">الباقة الحالية: <span className="text-white font-bold">{selectedTenant.plan_name || 'الباقة المؤسسية'}</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleRenewSubscription}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:brightness-110 cursor-pointer"
                >
                  🔄 تجديد الاشتراك تمديد (12 شهر إضافية)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-[#12241a] rounded-xl border border-[#d4af37]/20">
                  <div className="text-slate-400">تاريخ بداية الاشتراك:</div>
                  <div className="font-mono text-slate-200 font-bold mt-1">{selectedTenant.start_date || '2026-08-01'}</div>
                </div>
                <div className="p-3 bg-[#12241a] rounded-xl border border-[#d4af37]/20">
                  <div className="text-slate-400">تاريخ نهاية الاشتراك الحالي:</div>
                  <div className="font-mono text-amber-300 font-bold mt-1">{selectedTenant.end_date || '2027-08-01'}</div>
                </div>
                <div className="p-3 bg-[#12241a] rounded-xl border border-[#d4af37]/20">
                  <div className="text-slate-400">حالة الاشتراك:</div>
                  <div className="font-bold text-emerald-400 mt-1">🟢 {selectedTenant.subscription_status || 'نشط ومسدد'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENABLED MODULES OVERRIDE */}
          {tenantSubTab === 'features' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">تعديل المزايا والوحدات الاستثنائية لهذه الشركة</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(tenantDetailData?.features || [
                  { code: 'employees', name_ar: 'دليل الموظفين والهيكل', is_enabled: 1 },
                  { code: 'attendance', name_ar: 'الحضور والبصمة المباشرة', is_enabled: 1 },
                  { code: 'leaves', name_ar: 'الإجازات والطلبات الرسمية', is_enabled: 1 },
                  { code: 'payroll', name_ar: 'مسيرات الرواتب ومستحقات الموظفين', is_enabled: 1 },
                  { code: 'geofencing', name_ar: 'النطاق الجغرافي والخرائط', is_enabled: 1 }
                ]).map((feat: any) => (
                  <div key={feat.code} className="p-3 bg-[#12241a] rounded-xl border border-[#d4af37]/20 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-200">{feat.name_ar}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{feat.code}</div>
                    </div>
                    <span className="text-emerald-400 font-bold">🟢 مفعلة بالباقة</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMPANY ADMINS & USERS */}
          {tenantSubTab === 'admins' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">مستخدمو إدارة المنشأة (Company Admins)</h4>
              <div className="space-y-2">
                {(tenantDetailData?.users || [
                  { id: 1, full_name: 'مدير النظام', email: 'b.albanna@hadiyah.org.sa', status: 'active' }
                ]).map((u: any) => (
                  <div key={u.id} className="p-3 bg-[#12241a] rounded-xl border border-[#d4af37]/20 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-100">{u.full_name || 'مدير الحساب'}</div>
                      <div className="text-[11px] text-[#d4af37] font-mono">{u.email}</div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold text-[10px]">
                      🟢 {u.status || 'نشط'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EMPLOYEES LIST */}
          {tenantSubTab === 'employees' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">الموظفون المسجلون بالدليل ({tenantDetailData?.employees?.length || 5})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-slate-200">
                  <thead className="bg-[#12241a] text-[#d4af37] border-b border-[#d4af37]/20">
                    <tr>
                      <th className="p-2.5">الكود</th>
                      <th className="p-2.5">الاسم</th>
                      <th className="p-2.5">المسمى الوظيفي</th>
                      <th className="p-2.5">البريد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4af37]/10">
                    {(tenantDetailData?.employees || [
                      { id: 1, employee_code: 'EMP-001', first_name_ar: 'بلال', last_name_ar: 'البنا', job_title: 'كبير مهندسي النظم', email: 'b.albanna@hadiyah.org.sa' },
                      { id: 2, employee_code: 'EMP-002', first_name_ar: 'فهد', last_name_ar: 'الدوسري', job_title: 'مدير تقنية المعلومات', email: 'f.aldosari@hadiyah.org.sa' }
                    ]).map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-[#12241a]">
                        <td className="p-2.5 font-mono text-[#d4af37]">{emp.employee_code}</td>
                        <td className="p-2.5 font-bold">{emp.first_name_ar} {emp.last_name_ar}</td>
                        <td className="p-2.5">{emp.job_title}</td>
                        <td className="p-2.5 font-mono text-slate-300">{emp.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: BRANCHES */}
          {tenantSubTab === 'branches' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">فروع ومواقع المنشأة</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#12241a] rounded-xl border border-[#d4af37]/20">
                  <div className="font-bold text-slate-100">المقر الرئيسي - الرياض</div>
                  <div className="text-slate-400 text-[11px] mt-1">طريق الملك فهد - البرج الرئيسي</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: USAGE & STORAGE QUOTAS */}
          {tenantSubTab === 'usage' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">حدود الاستخدام والسعة التخزينية المستهلكة</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#12241a] rounded-2xl border border-[#d4af37]/20 space-y-2">
                  <div className="text-slate-400">الموظفون المستخدمون:</div>
                  <div className="text-xl font-bold font-mono text-[#d4af37]">{tenantDetailData?.usage?.employees_count || 5} / {tenantDetailData?.usage?.max_employees || 200}</div>
                  <div className="w-full bg-[#07120c] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#d4af37] h-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-[#12241a] rounded-2xl border border-[#d4af37]/20 space-y-2">
                  <div className="text-slate-400">مستخدمو الإدارة:</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">{tenantDetailData?.usage?.admins_count || 1} / {tenantDetailData?.usage?.max_admin_users || 10}</div>
                  <div className="w-full bg-[#07120c] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: '10%' }}></div>
                  </div>
                </div>

                <div className="p-4 bg-[#12241a] rounded-2xl border border-[#d4af37]/20 space-y-2">
                  <div className="text-slate-400">التخزين المستهلك:</div>
                  <div className="text-xl font-bold font-mono text-amber-300">{tenantDetailData?.usage?.storage_used_mb || 245} MB / 5120 MB</div>
                  <div className="w-full bg-[#07120c] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AUDIT LOGS */}
          {tenantSubTab === 'logs' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">سجل عمليات المنشأة (Audit Logs)</h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-3 bg-[#12241a] rounded-xl border border-[#d4af37]/15 flex justify-between">
                  <span className="text-emerald-400">[PLATFORM_TENANT_CREATED]</span>
                  <span className="text-slate-300">تم تدشين المنشأة بنجاح</span>
                  <span className="text-slate-500">{selectedTenant.created_at}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SUSPEND & ACTIVATE CONTROL */}
          {tenantSubTab === 'status' && (
            <div className="bg-[#07120c] p-6 rounded-2xl border border-[#d4af37]/20 text-xs space-y-4">
              <h4 className="font-bold text-[#d4af37] text-sm">التحكم الفوري بتعليم أو تفعيل المنشأة</h4>
              <p className="text-slate-400">عند تعليق المنشأة، سيتم حظر كافة المستخدمين والموظفين فوراً وتفعيل استجابة 403 Forbidden لبيئة هذه الشركة.</p>

              <div className="pt-2 flex gap-4">
                {selectedTenant.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('suspended')}
                    className="px-6 py-3 bg-red-950/80 border border-red-800 text-red-200 font-bold rounded-xl hover:bg-red-800 transition cursor-pointer"
                  >
                    🚫 تعليق حساب الشركة وإيقاف الوصول فوراً
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('active')}
                    className="px-6 py-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 font-bold rounded-xl hover:bg-emerald-800 transition cursor-pointer"
                  >
                    🟢 إعادة تفعيل حساب الشركة
                  </button>
                )}
              </div>
            </div>
          )}
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
                onClick={() => loadTenantDetails(t)}
                className="w-full py-2.5 bg-[#07120c] border border-[#d4af37]/30 text-[#d4af37] font-bold rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
              >
                🔍 عرض والتعديل على التبويبات الـ 10 ←
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
