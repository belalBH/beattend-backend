import React, { useState, useEffect } from 'react';
import { superAdminService } from '../superadmin/services/superadmin.service';

interface Props {
  onLoginSuccess?: (tenantInfo: any, user: any) => void;
  onSwitchToSuperAdmin?: () => void;
}

export const TenantLoginPage: React.FC<Props> = ({
  onLoginSuccess,
  onSwitchToSuperAdmin
}) => {
  const [companyCodeInput, setCompanyCodeInput] = useState<string>('HADIYAH');
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [resolving, setResolving] = useState<boolean>(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState<string>('admin@solutions.sa');
  const [password, setPassword] = useState<string>('••••••••');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for tenant e.g. ?tenant=hadiyah or ?company=ALFANAR
    const params = new URLSearchParams(window.location.search);
    const initialTenant = params.get('tenant') || params.get('company') || 'hadiyah';
    setCompanyCodeInput(initialTenant.toUpperCase());
    handleResolveTenant(initialTenant);
  }, []);

  const handleResolveTenant = async (identifier: string) => {
    if (!identifier.trim()) return;
    setResolving(true);
    setResolveError(null);
    setTenantInfo(null);
    try {
      const res = await superAdminService.resolveTenant(identifier);
      setTenantInfo(res);
    } catch (err: any) {
      setResolveError(err.message || 'تعذر العثور على الشركة بهذه الهوية أو الدومين');
    } finally {
      setResolving(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantInfo) {
      setLoginError('يرجى التأكد من اختيار شركة صحيحة أولاً');
      return;
    }

    if (tenantInfo.status === 'suspended') {
      setLoginError('⚠️ حساب هذه الشركة موقوف من قبل إدارة المنصة');
      return;
    }

    if (!email || !password) {
      setLoginError('البريد الإلكتروني وكلمة المرور حقول إجبارية');
      return;
    }

    setSubmitting(true);
    setLoginError(null);

    // Simulate Auth & Session Storage
    setTimeout(() => {
      setSubmitting(false);
      try {
        localStorage.setItem('beattend_tenant_id', tenantInfo.tenant_id);
        localStorage.setItem('beattend_company_code', tenantInfo.company_code);
      } catch (e) {
        console.warn('Storage unavailable:', e);
      }

      if (onLoginSuccess) {
        onLoginSuccess(tenantInfo, { email, role: 'Company Admin' });
      } else {
        alert(`تم تسجيل الدخول بنجاح إلى شركة (${tenantInfo.company_name}) [Tenant: ${tenantInfo.tenant_id}]`);
        window.location.href = `/?page=dashboard&tenant=${tenantInfo.company_code}#dashboard`;
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0f1e16] text-slate-100 flex flex-col justify-center items-center p-4 dir-rtl relative overflow-hidden" dir="rtl">
      {/* Background Glow Overlay */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 z-10">
        {/* Header Platform Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-3xl shadow-2xl mb-2">
            B
          </div>
          <h1 className="text-3xl font-black text-[#d4af37] tracking-wide">BeatAttend</h1>
          <p className="text-xs text-slate-400 font-semibold">منصة الموارد البشرية والحضور الذكي متعددة المنشآت (Multi-Tenant SaaS)</p>
        </div>

        {/* Tenant Card Box */}
        <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Step 1: Company Resolution Bar */}
          <div className="bg-[#0f1e16] border border-[#d4af37]/20 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">رمز الشركة أو الـ Subdomain:</span>
              {tenantInfo && (
                <span className="text-emerald-400 font-bold font-mono">✓ {tenantInfo.subdomain}</span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={companyCodeInput}
                onChange={(e) => setCompanyCodeInput(e.target.value.toUpperCase())}
                placeholder="مثال: HADIYAH أو ALFANAR"
                className="flex-1 px-3 py-2 bg-[#1b3325] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono text-xs font-bold uppercase focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="button"
                onClick={() => handleResolveTenant(companyCodeInput)}
                disabled={resolving}
                className="px-4 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
              >
                {resolving ? 'فحص...' : 'فحص الشركة'}
              </button>
            </div>

            {resolveError && (
              <p className="text-red-400 text-xs font-bold pt-1">⚠️ {resolveError}</p>
            )}
          </div>

          {/* Resolved Tenant Branding Header */}
          {tenantInfo && (
            <div className="p-4 bg-gradient-to-r from-[#234735]/80 to-[#1b3325] border border-[#d4af37]/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-[#d4af37]/30 flex items-center justify-center text-xl overflow-hidden">
                  🏢
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">{tenantInfo.company_name}</h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    الباقة: <span className="text-[#d4af37]">{tenantInfo.plan_name}</span>
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                tenantInfo.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {tenantInfo.status === 'active' ? '✓ شركة نشطة' : '⚠️ موقوفة'}
              </span>
            </div>
          )}

          {/* Step 2: User Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {loginError && (
              <div className="p-3 bg-red-900/60 border border-red-500/50 rounded-xl text-red-200 font-bold">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني المعتمد بالشركة *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="b.albanna@hadiyah.org.sa"
                className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-slate-300 font-bold">كلمة المرور *</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('يرجى التواصل مع مدير الموارد البشرية بالشركة لإعادة تعيين كلمة المرور'); }} className="text-[#d4af37] text-[11px] hover:underline font-semibold">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !tenantInfo || tenantInfo.status === 'suspended'}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-sm shadow-xl hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'جاري التحقق من الهوية والصلاحيات...' : '🔒 تسجيل الدخول إلى لوحة الشركة'}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-[#d4af37]/15 text-[11px] text-slate-400 space-y-2">
            <span className="block font-semibold text-slate-300">اختبار الدومينات والشركات الجاهزة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setCompanyCodeInput('HADIYAH'); handleResolveTenant('HADIYAH'); }}
                className="px-2.5 py-1 bg-[#0f1e16] border border-[#d4af37]/20 rounded-lg text-slate-200 hover:border-[#d4af37]"
              >
                🏢 HADIYAH
              </button>
              <button
                type="button"
                onClick={() => { setCompanyCodeInput('ALFANAR'); handleResolveTenant('ALFANAR'); }}
                className="px-2.5 py-1 bg-[#0f1e16] border border-[#d4af37]/20 rounded-lg text-slate-200 hover:border-[#d4af37]"
              >
                🏢 ALFANAR
              </button>
              <button
                type="button"
                onClick={() => { setCompanyCodeInput('RIYADHNET'); handleResolveTenant('RIYADHNET'); }}
                className="px-2.5 py-1 bg-[#0f1e16] border border-[#d4af37]/20 rounded-lg text-slate-200 hover:border-[#d4af37]"
              >
                🏢 RIYADHNET
              </button>
              <button
                type="button"
                onClick={() => { setCompanyCodeInput('DEMOCO'); handleResolveTenant('DEMOCO'); }}
                className="px-2.5 py-1 bg-red-950/40 border border-red-500/30 rounded-lg text-red-300 hover:border-red-500"
              >
                ⚠️ DEMOCO (موقوفة)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link to Super Admin */}
        {onSwitchToSuperAdmin && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToSuperAdmin}
              className="text-xs text-[#d4af37] underline font-bold hover:text-white transition cursor-pointer"
            >
              🛡️ الدخول إلى لوحة السوبر أدمن العامة (Super Admin Console)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
