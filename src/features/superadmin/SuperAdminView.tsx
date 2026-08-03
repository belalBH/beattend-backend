import React, { useState, useEffect } from 'react';
import { superAdminService } from './services/superadmin.service';
import { TenantFull, TenantOnboardInput } from './types/superadmin.types';
import { TenantCard } from './components/TenantCard';
import { TenantOnboardModal } from './components/TenantOnboardModal';

export const SuperAdminView: React.FC = () => {
  const [tenants, setTenants] = useState<TenantFull[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantFull | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await superAdminService.getTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل منشآت منصة BeatAttend');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (input: TenantOnboardInput) => {
    await superAdminService.onboardTenant(input);
    loadTenants();
  };

  const handleToggleStatus = async (tenant: TenantFull) => {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`⚠️ تغيير حالة الشركة: هل أنت تأكد من ${nextStatus === 'suspended' ? 'تعليق' : 'تفعيل'} اشتراك شركة (${tenant.company_name || tenant.company_code})؟`)) return;

    try {
      await superAdminService.updateTenantStatus(tenant.tenant_id, nextStatus);
      loadTenants();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الشركة');
    }
  };

  const filteredTenants = tenants.filter(t =>
    t.company_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.company_name && t.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 dir-rtl text-right p-2 md:p-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-black text-[#d4af37]">لوحة التحكم الفائقة للمنصة (Super Admin Command Center)</h1>
              <p className="text-xs text-slate-300 mt-1">إدارة الشركات متعددة المستأجرين (Multi-Tenants)، تخصيص الباقات، ومراقبة الحدود</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsOnboardModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            + تدشين شركة / منشأة جديدة
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1b3325]/90 border border-[#d4af37]/20 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-slate-400">إجمالي المنشآت المسجلة</span>
          <p className="text-2xl font-black text-[#d4af37] font-mono mt-1">{tenants.length} منشأة</p>
        </div>

        <div className="bg-[#1b3325]/90 border border-emerald-500/20 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-slate-400">الشركات النشطة</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {tenants.filter(t => t.status === 'active').length} شركة
          </p>
        </div>

        <div className="bg-[#1b3325]/90 border border-amber-500/20 rounded-2xl p-4 shadow-xl">
          <span className="text-xs text-slate-400">الشركات الموقوفة / المنتهية</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {tenants.filter(t => t.status !== 'active').length} شركة
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#1b3325]/90 border border-[#d4af37]/20 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="بحث باسم الشركة، الرمز، أو الدومين..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-[#d4af37]"
        />
        <div className="text-xs text-slate-400 font-mono">
          عزل البيانات: <span className="text-emerald-400 font-bold">100% Strict Tenant Isolation Active</span>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#d4af37] text-sm font-bold animate-pulse">جاري جلب المنشآت من MariaDB Staging...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/60 border border-red-500 rounded-2xl text-red-200 text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Tenants Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((t) => (
            <TenantCard
              key={t.tenant_id}
              tenant={t}
              onToggleStatus={handleToggleStatus}
              onViewDetails={(tenant) => setSelectedTenant(tenant)}
            />
          ))}
        </div>
      )}

      {/* Onboard Modal */}
      <TenantOnboardModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onOnboard={handleOnboard}
      />

      {/* Tenant Details Drawer / Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
          <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#d4af37]">🏢 تفاصيل المنشأة واستفادة الباقة</h2>
                <p className="text-xs text-slate-400">{selectedTenant.company_name} ({selectedTenant.tenant_id})</p>
              </div>
              <button type="button" onClick={() => setSelectedTenant(null)} className="text-slate-400 font-bold hover:text-white text-lg cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-200">
              <div className="flex justify-between p-2.5 bg-[#0f1e16] rounded-xl border border-[#d4af37]/15">
                <span>رمز الشركة (Code):</span>
                <span className="text-[#d4af37] font-bold">{selectedTenant.company_code}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0f1e16] rounded-xl border border-[#d4af37]/15">
                <span>رابط الـ Subdomain:</span>
                <span className="text-emerald-400 font-bold">https://{selectedTenant.subdomain}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0f1e16] rounded-xl border border-[#d4af37]/15">
                <span>الباقة الحالية:</span>
                <span className="text-slate-100 font-bold">{selectedTenant.plan_name || 'الباقة المؤسسية'}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0f1e16] rounded-xl border border-[#d4af37]/15">
                <span>استهلاك الموظفين:</span>
                <span className="text-emerald-400 font-bold">{selectedTenant.current_employees_count} من أصل {selectedTenant.max_employees}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#0f1e16] rounded-xl border border-[#d4af37]/15">
                <span>حد المدراء المسموح:</span>
                <span className="text-slate-100 font-bold">{selectedTenant.max_admin_users} مدراء</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTenant(null)}
              className="w-full py-3 bg-[#0f1e16] text-[#d4af37] border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
