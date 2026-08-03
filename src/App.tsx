import React, { useState, useEffect } from "react";
import { TenantDashboardView } from "./features/dashboard/TenantDashboardView";
import { CompaniesView } from "./features/companies/CompaniesView";
import { EmployeesView } from "./features/employees/EmployeesView";
import { AttendanceView } from "./features/attendance/AttendanceView";
import { LeavesView } from "./features/leaves/LeavesView";
import { GeofencesView } from "./features/geofences/GeofencesView";
import { SuperAdminView } from "./features/superadmin/SuperAdminView";
import { TenantLoginPage } from "./features/auth/TenantLoginPage";
import { AccountActivationPage } from "./features/auth/AccountActivationPage";
import { PlatformLoginPage } from "./features/platform/PlatformLoginPage";
import { PlatformConsoleLayout } from "./features/platform/PlatformConsoleLayout";
import { UsersAndPermissionsView } from "./features/settings/UsersAndPermissionsView";
import { UnderIntegration } from "./components/UnderIntegration";

export default function App() {
  const getInitialTab = () => {
    const validTabs = ['dashboard', 'login', 'platform_login', 'platform', 'activate', 'superadmin', 'companies', 'employees', 'attendance', 'leaves', 'locations', 'shifts', 'payroll', 'documents', 'reports', 'roles', 'settings'];
    const urlParams = new URLSearchParams(window.location.search);
    const queryTab = urlParams.get('page') || '';
    const hashTab = window.location.hash.replace('#', '').trim();
    const pathname = window.location.pathname;

    if (pathname.includes('/platform/login')) return 'platform_login';
    if (pathname.includes('/platform')) return 'platform';

    if (validTabs.includes(queryTab)) return queryTab;
    if (validTabs.includes(hashTab)) return hashTab;
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (tab === 'platform_login') {
      window.history.replaceState({ page: tab }, '', `/platform/login?page=${tab}#${tab}`);
    } else if (tab === 'platform') {
      window.history.replaceState({ page: tab }, '', `/platform/dashboard`);
    } else {
      window.history.replaceState({ page: tab }, '', `${window.location.pathname}?page=${tab}#${tab}`);
    }
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const validTabs = ['dashboard', 'login', 'platform_login', 'platform', 'activate', 'superadmin', 'companies', 'employees', 'attendance', 'leaves', 'locations', 'shifts', 'payroll', 'documents', 'reports', 'roles', 'settings'];
      const urlParams = new URLSearchParams(window.location.search);
      const queryTab = urlParams.get('page') || '';
      const hashTab = window.location.hash.replace('#', '').trim();
      const pathname = window.location.pathname;

      if (pathname.includes('/platform/login')) {
        setActiveTabState('platform_login');
        return;
      }
      if (pathname.includes('/platform')) {
        setActiveTabState('platform');
        return;
      }

      const current = validTabs.includes(queryTab) ? queryTab : validTabs.includes(hashTab) ? hashTab : '';
      if (current) {
        setActiveTabState(current);
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const allNavItems = [
    { id: 'dashboard', label: 'لوحة التحكم الرئيسية', icon: '📊', isLive: true },
    { id: 'employees', label: 'دليل الموظفين', icon: '👥', isLive: true },
    { id: 'attendance', label: 'الحضور والبصمة', icon: '⏱️', isLive: true },
    { id: 'leaves', label: 'الإجازات والطلبات', icon: '📅', isLive: true },
    { id: 'locations', label: 'النطاق الجغرافي', icon: '📍', isLive: true },
    { id: 'roles', label: 'المستخدمون والصلاحيات', icon: '🔐', isLive: true },
    { id: 'shifts', label: 'مناوبات العمل', icon: '🔄', isLive: false },
    { id: 'payroll', label: 'مسيرات الرواتب', icon: '💰', isLive: true },
    { id: 'documents', label: 'المستندات والملفات', icon: '📁', isLive: false },
    { id: 'reports', label: 'التقارير والإحصائيات', icon: '📈', isLive: false },
    { id: 'settings', label: 'إعدادات النظام', icon: '⚙️', isLive: false },
  ];

  const navItems = allNavItems;

  if (activeTab === 'platform_login') {
    return (
      <PlatformLoginPage
        onLoginSuccess={(token, user) => {
          setActiveTab('platform');
        }}
      />
    );
  }

  if (activeTab === 'platform') {
    return <PlatformConsoleLayout />;
  }

  if (activeTab === 'login') {
    return (
      <TenantLoginPage
        onLoginSuccess={(t) => {
          alert(`مرحباً بك في لوحة تحكم شركة ${t.company_name}`);
          setActiveTab('dashboard');
        }}
        onSwitchToSuperAdmin={() => {
          setActiveTab('platform_login');
        }}
      />
    );
  }

  if (activeTab === 'activate') {
    return (
      <AccountActivationPage
        onActivationSuccess={(email, code) => {
          setActiveTab('login');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1e16] text-slate-100 font-sans flex flex-col md:flex-row dir-rtl" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#1b3325] border-l border-[#d4af37]/20 flex flex-col justify-between p-5 shrink-0 shadow-2xl z-20">
        <div>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-xl flex items-center justify-center shadow-lg">
              B
            </div>
            <div>
              <h1 className="text-lg font-black text-[#d4af37] tracking-wide">BeatAttend</h1>
              <p className="text-[11px] text-slate-400 font-semibold truncate max-w-[170px]">
                شركة هداية للحلول التقنية
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold shadow-lg translate-x-1'
                    : 'text-slate-300 hover:bg-[#234735] hover:text-[#d4af37]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <span className="whitespace-nowrap truncate">{item.label}</span>
                </div>
                {!item.isLive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#0f1e16]/60 text-slate-400 font-normal shrink-0 mr-1">
                    قيد التجهيز
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#d4af37]/10 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex justify-between items-center">
            <span>البيئة:</span>
            <span className="text-[#d4af37] font-mono">Staging SaaS Live</span>
          </div>
          <div className="flex justify-between items-center">
            <span>التنظيم:</span>
            <span className="text-emerald-400 font-mono">Tenant Isolated</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f1e16]">
        {/* Top Header */}
        <header className="h-16 bg-[#1b3325]/80 border-b border-[#d4af37]/20 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#d4af37]">
              {allNavItems.find(n => n.id === activeTab)?.label || 'لوحة التحكم'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('platform_login')}
              className="px-3 py-1.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-xs text-[#d4af37] font-semibold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer flex items-center gap-1.5"
            >
              🛡️ بوابة السوبر أدمن المستقلة
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold hover:bg-slate-700 transition cursor-pointer"
            >
              🔑 خروج / شاشة الدخول
            </button>

            <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center font-bold text-[#d4af37] text-xs">
              AD
            </div>
          </div>
        </header>

        {/* View Component Switcher */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <TenantDashboardView />}
          {activeTab === 'companies' && <CompaniesView />}
          {activeTab === 'employees' && <EmployeesView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'leaves' && <LeavesView />}
          {activeTab === 'locations' && <GeofencesView />}
          {activeTab === 'roles' && <UsersAndPermissionsView />}

          {['shifts', 'payroll', 'documents', 'reports', 'settings'].includes(activeTab) && (
            <UnderIntegration moduleName={allNavItems.find(n => n.id === activeTab)?.label || ''} />
          )}
        </div>
      </main>
    </div>
  );
}
