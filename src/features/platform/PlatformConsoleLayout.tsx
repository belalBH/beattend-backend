import React, { useState, useEffect } from 'react';
import { PlatformDashboardView } from './dashboard/PlatformDashboardView';
import { PlatformConsoleView } from './PlatformConsoleView';
import { PlatformPlansView } from './plans/PlatformPlansView';
import { PlatformFeaturesView } from './features/PlatformFeaturesView';
import { PlatformSubscriptionsView } from './subscriptions/PlatformSubscriptionsView';
import { PlatformUsersView } from './users/PlatformUsersView';
import { PlatformSupportView } from './support/PlatformSupportView';
import { PlatformSettingsView } from './settings/PlatformSettingsView';

export const PlatformConsoleLayout: React.FC = () => {
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith('/platform/dashboard')) return 'dashboard';
    if (path.startsWith('/platform/tenants')) return 'tenants';
    if (path.startsWith('/platform/plans')) return 'plans';
    if (path.startsWith('/platform/subscriptions')) return 'subscriptions';
    if (path.startsWith('/platform/features')) return 'features';
    if (path.startsWith('/platform/users')) return 'users';
    if (path.startsWith('/platform/usage')) return 'usage';
    if (path.startsWith('/platform/storage')) return 'storage';
    if (path.startsWith('/platform/support')) return 'support';
    if (path.startsWith('/platform/audit-logs')) return 'audit';
    if (path.startsWith('/platform/settings')) return 'settings';
    return 'dashboard';
  };

  const [currentRoute, setCurrentRouteState] = useState<string>(getInitialRoute);

  const navigateTo = (routeKey: string) => {
    setCurrentRouteState(routeKey);
    const targetUrl = `/platform/${routeKey}`;
    window.history.pushState({ platformRoute: routeKey }, '', targetUrl);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRouteState(getInitialRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'اللوحة التنفيذية', icon: '📊', path: '/platform/dashboard' },
    { id: 'tenants', label: 'الشركات والمنشآت', icon: '🏢', path: '/platform/tenants' },
    { id: 'plans', label: 'الباقات والأسعار', icon: '💰', path: '/platform/plans' },
    { id: 'subscriptions', label: 'الاشتراكات', icon: '📅', path: '/platform/subscriptions' },
    { id: 'features', label: 'الوحدات والمزايا', icon: '🧩', path: '/platform/features' },
    { id: 'users', label: 'مستخدمو المنصة (RBAC)', icon: '🛡️', path: '/platform/users' },
    { id: 'usage', label: 'حدود الاستخدام', icon: '⚡', path: '/platform/usage' },
    { id: 'storage', label: 'التخزين والمظلات', icon: '☁️', path: '/platform/storage' },
    { id: 'support', label: 'الدعم والتذاكر', icon: '💬', path: '/platform/support' },
    { id: 'audit', label: 'سجلات المنصة (Audit)', icon: '📜', path: '/platform/audit-logs' },
    { id: 'settings', label: 'إعدادات المنصة', icon: '⚙️', path: '/platform/settings' }
  ];

  return (
    <div className="min-h-screen bg-[#07120c] text-slate-100 font-sans flex flex-col md:flex-row dir-rtl text-right" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0e1d15] border-l border-[#d4af37]/20 p-5 shrink-0 flex flex-col justify-between space-y-6 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-2xl flex items-center justify-center shadow-xl">
              🛡️
            </div>
            <div>
              <h1 className="text-lg font-black text-[#d4af37]">BeatAttend SaaS</h1>
              <p className="text-[11px] text-slate-400 font-mono">Platform Console v2026</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                  currentRoute === item.id
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] shadow-lg translate-x-1'
                    : 'text-slate-300 hover:bg-[#182f22] hover:text-[#d4af37]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#d4af37]/15 text-[11px] text-slate-400 space-y-1 font-mono">
          <div>البيئة: <span className="text-emerald-400 font-bold">Staging Live</span></div>
          <div>النطاق: <span className="text-[#d4af37]">Platform Super Admin</span></div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07120c]">
        {/* Topbar Header */}
        <header className="h-16 bg-[#0e1d15]/90 border-b border-[#d4af37]/20 flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">المسار الحالي:</span>
            <span className="px-3 py-1 bg-[#12241a] border border-[#d4af37]/30 text-[#d4af37] text-xs font-mono font-bold rounded-lg">
              /platform/{currentRoute}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400">سوبر أدمن معتمد</span>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('beattend_platform_token');
                window.location.href = '/platform/login';
              }}
              className="px-3 py-1.5 bg-red-950/60 border border-red-800/80 text-xs font-bold text-red-300 rounded-xl hover:bg-red-800 transition cursor-pointer"
            >
              🚪 خروج
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <main className="p-6 flex-1 overflow-y-auto">
          {currentRoute === 'dashboard' && <PlatformDashboardView />}
          {currentRoute === 'tenants' && <PlatformConsoleView />}
          {currentRoute === 'plans' && <PlatformPlansView />}
          {currentRoute === 'subscriptions' && <PlatformSubscriptionsView />}
          {currentRoute === 'features' && <PlatformFeaturesView />}
          {currentRoute === 'users' && <PlatformUsersView />}
          {currentRoute === 'support' && <PlatformSupportView />}
          {currentRoute === 'settings' && <PlatformSettingsView />}

          {['usage', 'storage', 'audit'].includes(currentRoute) && (
            <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-8 shadow-2xl text-center space-y-4">
              <div className="text-4xl">🚧</div>
              <h2 className="text-xl font-bold text-[#d4af37]">
                صفحة {navItems.find(n => n.id === currentRoute)?.label}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                تم تجهيز الـ Route والتخطيط والمعماري بنجاح. سيتم الانتقال لتشغيل هذا الموديول بالكامل ضمن الـ Phase التالية حسب الخطة المعتمدة.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
                >
                  ← العودة للوحة التنفيذية
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
