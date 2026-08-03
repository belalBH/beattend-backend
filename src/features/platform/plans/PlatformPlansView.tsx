import React, { useState, useEffect } from 'react';

export const PlatformPlansView: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [description, setDescription] = useState('');
  const [priceMonthly, setPriceMonthly] = useState<number>(500);
  const [priceAnnual, setPriceAnnual] = useState<number>(5000);
  const [trialDays, setTrialDays] = useState<number>(14);
  const [maxEmployees, setMaxEmployees] = useState<number>(50);
  const [maxAdminUsers, setMaxAdminUsers] = useState<number>(5);
  const [maxBranches, setMaxBranches] = useState<number>(3);
  const [maxGeofences, setMaxGeofences] = useState<number>(5);
  const [storageLimitMb, setStorageLimitMb] = useState<number>(5120);
  const [maxDevices, setMaxDevices] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'employees', 'attendance', 'leaves', 'roles_permissions', 'mobile_app'
  ]);

  const availableModules = [
    { code: 'employees', label: 'دليل الموظفين والهيكل التنظيمي' },
    { code: 'attendance', label: 'الحضور والانصراف وتتبع البصمة' },
    { code: 'leaves', label: 'إدارة الإجازات والطلبات الرسمية' },
    { code: 'shifts', label: 'مناوبات العمل والوردية المتغيرة' },
    { code: 'geofencing', label: 'النطاق الجغرافي والخرائط' },
    { code: 'payroll', label: 'مسيرات الرواتب ومستحقات الموظفين' },
    { code: 'documents', label: 'إدارة المستندات والعقود' },
    { code: 'reports', label: 'التقارير والمؤشرات التفصيلية' },
    { code: 'roles_permissions', label: 'إدارة الأدوار والصلاحيات RBAC' },
    { code: 'mobile_app', label: 'تطبيق الجوال (crystal_hr)' },
    { code: 'api_access', label: 'الربط البرمجي (API Access)' },
    { code: 'odoo_integration', label: 'التكامل مع منصة أودو (Odoo ERP)' },
    { code: 'mudad_integration', label: 'التكامل مع نظام مدد (Mudad)' },
    { code: 'whatsapp_notifications', label: 'إشعارات الواتساب الفورية' },
    { code: 'ai_copilot', label: 'مساعد الموارد البشرية الذكي AI' }
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/php_api/api.php?route=platform_plans', {
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data || []);
      } else {
        setError(data.message || 'فشل تحميل قائمة الباقات');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API الباقات');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setNameAr('');
    setNameEn('');
    setPlanCode(`PLAN-${Math.floor(100 + Math.random() * 900)}`);
    setDescription('');
    setPriceMonthly(500);
    setPriceAnnual(5000);
    setTrialDays(14);
    setMaxEmployees(50);
    setMaxAdminUsers(5);
    setMaxBranches(3);
    setMaxGeofences(5);
    setStorageLimitMb(5120);
    setMaxDevices(10);
    setIsActive(true);
    setIsPublic(true);
    setSelectedFeatures(['employees', 'attendance', 'leaves', 'roles_permissions', 'mobile_app']);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditingPlan(plan);
    setNameAr(plan.name_ar || '');
    setNameEn(plan.name_en || '');
    setPlanCode(plan.plan_code || '');
    setDescription(plan.description || '');
    setPriceMonthly(plan.price_monthly || 0);
    setPriceAnnual(plan.price_annual || 0);
    setTrialDays(plan.trial_days || 14);
    setMaxEmployees(plan.max_employees || 50);
    setMaxAdminUsers(plan.max_admin_users || 5);
    setMaxBranches(plan.max_branches || 3);
    setMaxGeofences(plan.max_geofences || 5);
    setStorageLimitMb(plan.storage_limit_mb || 5120);
    setMaxDevices(plan.max_devices || 10);
    setIsActive(Boolean(plan.is_active));
    setIsPublic(Boolean(plan.is_public));
    setSelectedFeatures(plan.enabled_features || []);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr) {
      alert('يرجى إدخال اسم الباقة بالعربية');
      return;
    }

    setSubmitting(true);
    const payload = {
      name_ar: nameAr,
      name_en: nameEn || nameAr,
      plan_code: planCode,
      description,
      price_monthly: Number(priceMonthly),
      price_annual: Number(priceAnnual),
      trial_days: Number(trialDays),
      max_employees: Number(maxEmployees),
      max_admin_users: Number(maxAdminUsers),
      max_branches: Number(maxBranches),
      max_geofences: Number(maxGeofences),
      storage_limit_mb: Number(storageLimitMb),
      max_devices: Number(maxDevices),
      is_active: isActive,
      is_public: isPublic,
      enabled_features: selectedFeatures
    };

    try {
      const url = editingPlan
        ? `/php_api/api.php?route=platform_plans&id=${editingPlan.id}`
        : '/php_api/api.php?route=platform_plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert(editingPlan ? 'تم تحديث الباقة بنجاح' : 'تم إنشاء الباقة بنجاح');
        setIsModalOpen(false);
        loadPlans();
      } else {
        alert(data.message || 'فشل حفظ الباقة');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال بالخادم عند حفظ الباقة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (plan: any) => {
    if (!window.confirm(`هل أنت تأكد من حذف الباقة (${plan.name_ar})؟`)) return;

    try {
      const res = await fetch(`/php_api/api.php?route=platform_plans&id=${plan.id}`, {
        method: 'DELETE',
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        alert('تم حذف الباقة بنجاح');
        loadPlans();
      } else {
        alert(data.message || 'فشل حذف الباقة');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال بالخادم أثناء الحذف');
    }
  };

  const toggleFeatureCode = (code: string) => {
    if (selectedFeatures.includes(code)) {
      setSelectedFeatures(selectedFeatures.filter(c => c !== code));
    } else {
      setSelectedFeatures([...selectedFeatures, code]);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      {/* Top Header */}
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className="text-2xl font-black text-[#d4af37]">إدارة الباقات والأسعار (Subscription Plans CRUD)</h1>
              <p className="text-xs text-slate-400 mt-1">تحديد أسعار الاشتراكات، حد الموظفين، السعة التخزينية وتعيين المزايا والوحدات المفعلة</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-2xl text-xs shadow-xl hover:brightness-110 transition cursor-pointer flex items-center gap-2"
        >
          ➕ إضافة باقة جديدة
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#d4af37] space-y-3">
          <div className="w-10 h-10 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold">جاري تحميل الباقات والأسعار حياً من DB...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/80 border border-red-800 rounded-3xl text-red-200 text-xs font-bold text-center space-y-3">
          <div>⚠️ {error}</div>
          <button type="button" onClick={loadPlans} className="px-4 py-2 bg-red-800 text-white rounded-xl hover:bg-red-700 transition">
            إعادة المحاولة 🔄
          </button>
        </div>
      ) : (
        /* Plans Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between hover:border-[#d4af37]/60 transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2.5 py-0.5 rounded-full font-mono font-bold">
                      {plan.plan_code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-1">{plan.name_ar}</h3>
                    <p className="text-[11px] text-slate-400">{plan.name_en}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${plan.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {plan.is_active ? '🟢 مفعلة للبيع' : '🔴 معطلة'}
                  </span>
                </div>

                {/* Price Display */}
                <div className="bg-[#07120c] p-4 rounded-2xl border border-[#d4af37]/20 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-400">الاشتراك الشهري</div>
                    <div className="text-xl font-black text-[#d4af37] font-mono">{plan.price_monthly} <span className="text-xs font-normal">ر.س</span></div>
                  </div>
                  <div className="text-left border-r border-[#d4af37]/20 pr-4">
                    <div className="text-xs text-slate-400">الاشتراك السنوي</div>
                    <div className="text-xl font-black text-amber-300 font-mono">{plan.price_annual} <span className="text-xs font-normal">ر.س</span></div>
                  </div>
                </div>

                {/* Limits Breakdown */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-[#d4af37]/10">
                    <span>👥 حد الموظفين:</span>
                    <span className="font-bold font-mono text-[#d4af37]">{plan.max_employees} موظف</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d4af37]/10">
                    <span>🛡️ حد الإداريين:</span>
                    <span className="font-bold font-mono text-[#d4af37]">{plan.max_admin_users} مدير</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d4af37]/10">
                    <span>🏢 حد الفروع:</span>
                    <span className="font-bold font-mono text-[#d4af37]">{plan.max_branches} فروع</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d4af37]/10">
                    <span>☁️ سعة التخزين:</span>
                    <span className="font-bold font-mono text-[#d4af37]">{Math.round(plan.storage_limit_mb / 1024)} GB</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>🏢 الشركات المشتركة:</span>
                    <span className="font-bold font-mono text-emerald-400">{plan.active_companies_count || 0} شركة</span>
                  </div>
                </div>

                {/* Enabled Modules Count */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 mb-1.5">الوحدات المفعلة بالباقة ({plan.enabled_features?.length || 0}):</div>
                  <div className="flex flex-wrap gap-1">
                    {(plan.enabled_features || []).slice(0, 5).map((fCode: string) => (
                      <span key={fCode} className="text-[10px] bg-[#07120c] text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 rounded-lg font-mono">
                        {fCode}
                      </span>
                    ))}
                    {(plan.enabled_features?.length || 0) > 5 && (
                      <span className="text-[10px] bg-[#07120c] text-slate-400 px-2 py-0.5 rounded-lg">
                        +{(plan.enabled_features?.length || 0) - 5} وحدات
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-[#d4af37]/20 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="flex-1 py-2.5 bg-[#07120c] border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                >
                  ✏️ تعديل الباقة
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlan(plan)}
                  className="px-3 py-2.5 bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-bold rounded-xl hover:bg-red-800 hover:text-white transition cursor-pointer"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#12241a] border border-[#d4af37]/50 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-6 text-right dir-rtl my-8">
            <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
              <h2 className="text-lg font-bold text-[#d4af37]">
                {editingPlan ? `✏️ تعديل الباقة (${editingPlan.name_ar})` : '➕ إضافة باقة اشتراك جديدة'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              {/* Row 1: Names & Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">اسم الباقة (عربي) *</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">اسم الباقة (English)</label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">كود الباقة (Plan Code)</label>
                  <input
                    type="text"
                    required
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono uppercase focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Prices & Trial */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">السعر الشهري (ر.س)</label>
                  <input
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">السعر السنوي (ر.س)</label>
                  <input
                    type="number"
                    value={priceAnnual}
                    onChange={(e) => setPriceAnnual(Number(e.target.value))}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">فترة التجربة (أيام)</label>
                  <input
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(Number(e.target.value))}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Limits */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">حد الموظفين</label>
                  <input
                    type="number"
                    value={maxEmployees}
                    onChange={(e) => setMaxEmployees(Number(e.target.value))}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">حد الإداريين</label>
                  <input
                    type="number"
                    value={maxAdminUsers}
                    onChange={(e) => setMaxAdminUsers(Number(e.target.value))}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">حد الفروع</label>
                  <input
                    type="number"
                    value={maxBranches}
                    onChange={(e) => setMaxBranches(Number(e.target.value))}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">حد التخزين (MB)</label>
                  <input
                    type="number"
                    value={storageLimitMb}
                    onChange={(e) => setStorageLimitMb(Number(e.target.value))}
                    className="w-full bg-[#07120c] border border-[#d4af37]/30 rounded-xl p-2.5 text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              {/* Enabled Modules Matrix Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-[#d4af37]/20">
                <label className="block text-slate-200 font-bold">المزايا والوحدات المفعلة للباقة:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-[#07120c] rounded-2xl border border-[#d4af37]/20">
                  {availableModules.map((mod) => (
                    <label key={mod.code} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-[#182f22]">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(mod.code)}
                        onChange={() => toggleFeatureCode(mod.code)}
                        className="accent-[#d4af37] w-4 h-4"
                      />
                      <span className="text-slate-200">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'جاري الحفظ...' : editingPlan ? 'حفظ التعديلات' : 'إنشاء الباقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
