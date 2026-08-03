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
  // Step 1 vs Step 2 state
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Domain / Company Code
  const [domainInput, setDomainInput] = useState<string>('HADIYAH');
  const [resolving, setResolving] = useState<boolean>(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  // Step 2: Role & Credentials
  const [userRoleTab, setUserRoleTab] = useState<'admin' | 'employee'>('admin');
  const [email, setEmail] = useState<string>('b.albanna@hadiyah.org.sa');
  const [password, setPassword] = useState<string>('••••••••');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // Detect domain from URL if available e.g. ?tenant=hadiyah
    const params = new URLSearchParams(window.location.search);
    const initialTenant = params.get('tenant') || params.get('company') || '';
    if (initialTenant) {
      setDomainInput(initialTenant.toUpperCase());
      handleResolveDomain(initialTenant, true);
    }
  }, []);

  const handleResolveDomain = async (identifier: string, autoProceed = false) => {
    if (!identifier.trim()) {
      setResolveError('يرجى إدخال رمز الشركة أو الـ Subdomain أولاً');
      return;
    }

    setResolving(true);
    setResolveError(null);
    try {
      const res = await superAdminService.resolveTenant(identifier);
      setTenantInfo(res);
      setStep(2);
    } catch (err: any) {
      setResolveError(err.message || 'تعذر العثور على الشركة بهذه الهوية أو الدومين');
      setTenantInfo(null);
    } finally {
      setResolving(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantInfo) return;

    if (tenantInfo.status === 'suspended') {
      setLoginError('⚠️ حساب هذه الشركة معطل حالياً من قبل إدارة المنصة');
      return;
    }

    if (!email || !password) {
      setLoginError('البريد الإلكتروني وكلمة المرور حقول إجبارية');
      return;
    }

    setSubmitting(true);
    setLoginError(null);

    setTimeout(() => {
      setSubmitting(false);
      try {
        localStorage.setItem('beattend_tenant_id', tenantInfo.tenant_id);
        localStorage.setItem('beattend_company_code', tenantInfo.company_code);
      } catch (e) {
        console.warn('Storage unavailable:', e);
      }

      if (onLoginSuccess) {
        onLoginSuccess(tenantInfo, { email, role: userRoleTab });
      } else {
        alert(`تم تسجيل الدخول بنجاح إلى شركة (${tenantInfo.company_name})`);
        window.location.href = `/?page=dashboard&tenant=${tenantInfo.company_code}#dashboard`;
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row dir-rtl bg-[#f8fafc] text-slate-800 font-sans" dir="rtl">
      {/* Right / Main White Login Card Column */}
      <div className="w-full md:w-[480px] lg:w-[540px] shrink-0 min-h-screen flex flex-col justify-between p-6 sm:p-12 bg-white z-10 shadow-2xl">
        {/* Top Header Logo */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0e382c] to-[#1a5a47] text-white font-black text-xl flex items-center justify-center shadow-md">
              B
            </div>
            <span className="text-xl font-black text-[#0e382c] tracking-wide">BeatAttend</span>
          </div>

          {onSwitchToSuperAdmin && (
            <button
              type="button"
              onClick={onSwitchToSuperAdmin}
              className="text-xs text-[#0e382c] font-bold hover:underline cursor-pointer"
            >
              🛡️ لوحة السوبر أدمن
            </button>
          )}
        </div>

        {/* Center Login Card Form */}
        <div className="my-auto max-w-sm w-full mx-auto space-y-6">
          {/* STEP 1: Enter Subdomain / Company Code */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-[#0e382c]">أهلاً بك مجدداً</h2>
                <p className="text-xs text-slate-500 font-medium">أدخل رمز الشركة أو الـ Subdomain للمتابعة</p>
              </div>

              {resolveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  ⚠️ {resolveError}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleResolveDomain(domainInput);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رمز الشركة أو الـ Subdomain *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value.toUpperCase())}
                      placeholder="hadiyah.beattend.com أو HADIYAH"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs font-bold font-mono focus:outline-none focus:border-[#0e382c] focus:bg-white transition"
                    />
                    <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm">🌐</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resolving}
                  className="w-full py-3.5 bg-[#0e382c] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#134939] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resolving ? 'جاري التحقق من المنشأة...' : 'متابعة ←'}
                </button>
              </form>

              {/* Demo Fast Preset Chips */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="block text-[11px] font-bold text-slate-400">منشآت تجريبية جاهزة للاختبار السريع:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setDomainInput('HADIYAH'); handleResolveDomain('HADIYAH'); }}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#0e382c] hover:text-white transition cursor-pointer"
                  >
                    🏢 HADIYAH
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDomainInput('ALFANAR'); handleResolveDomain('ALFANAR'); }}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#0e382c] hover:text-white transition cursor-pointer"
                  >
                    🏢 ALFANAR
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDomainInput('RIYADHNET'); handleResolveDomain('RIYADHNET'); }}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#0e382c] hover:text-white transition cursor-pointer"
                  >
                    🏢 RIYADHNET
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDomainInput('DEMOCO'); handleResolveDomain('DEMOCO'); }}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                  >
                    ⚠️ DEMOCO
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Resolved Tenant Username & Password */}
          {step === 2 && tenantInfo && (
            <div className="space-y-6">
              {/* Resolved Company Badge & Change Domain Option */}
              <div className="p-3 bg-[#0e382c]/5 border border-[#0e382c]/15 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0e382c] text-white flex items-center justify-center font-bold text-xs">
                    🏢
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0e382c]">{tenantInfo.company_name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{tenantInfo.subdomain}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] font-bold text-[#0e382c] underline hover:text-emerald-700 cursor-pointer"
                >
                  تغيير الدومين
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-[#0e382c]">أهلاً بك مجدداً</h2>
                <p className="text-xs text-slate-500 font-medium">الرجاء تسجيل الدخول للمتابعة</p>
              </div>

              {/* Role Toggle Switcher (مسؤول / تاجر / موظف) */}
              <div className="bg-slate-100 p-1 rounded-xl flex">
                <button
                  type="button"
                  onClick={() => setUserRoleTab('admin')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    userRoleTab === 'admin'
                      ? 'bg-white text-[#0e382c] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🛡️ مسؤول المنشأة
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleTab('employee')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    userRoleTab === 'employee'
                      ? 'bg-white text-[#0e382c] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  👥 موظف
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">البريد الإلكتروني *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-[#0e382c] focus:bg-white transition"
                    />
                    <span className="absolute left-3.5 top-3 text-slate-400 text-sm">✉️</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-bold text-slate-700">كلمة المرور *</label>
                    <a
                      href="#forgot"
                      onClick={(e) => { e.preventDefault(); alert('يرجى التواصل مع مسؤول الموارد البشرية بالشركة لإعادة تعيين كلمة المرور'); }}
                      className="text-[11px] font-bold text-[#0e382c] hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono focus:outline-none focus:border-[#0e382c] focus:bg-white transition"
                    />
                    <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔒</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || tenantInfo.status === 'suspended'}
                  className="w-full py-3.5 bg-[#0e382c] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#134939] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'جاري التحقق...' : 'دخول ←'}
                </button>
              </form>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 flex justify-between items-center">
                <span>اختبار تجريبي:</span>
                <span className="font-mono font-bold">b.albanna@hadiyah.org.sa</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-400 font-medium">
          .BeatAttend SaaS Engine. All rights reserved 2026 ©
        </div>
      </div>

      {/* Left / Hero Dark Forest Green Column (Matching Esal reference screenshot) */}
      <div className="hidden md:flex flex-1 bg-[#0e382c] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Top Right Brand Logo & Tagline */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-widest text-[#d4af37]">BeatAttend</span>
          </div>
          <span className="text-xs text-slate-300 font-semibold px-3 py-1 bg-white/10 rounded-full border border-white/20">
            Enterprise HR Suite
          </span>
        </div>

        {/* Hero Middle Typography */}
        <div className="my-auto max-w-lg space-y-6 z-10 text-left" dir="ltr">
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-100">
            Enterprise HR & Attendance for a smarter <br />
            <span className="text-[#d4af37]">.future</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-light">
            Manage your business with BeatAttend&apos;s comprehensive dashboard, real-time analytics, payroll processing, and geospatial tracking.
          </p>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        {/* Bottom Copyright */}
        <div className="text-xs text-slate-400 font-mono z-10 text-right dir-rtl">
          .BeatAttend Inc. All rights reserved 2026 ©
        </div>
      </div>
    </div>
  );
};
