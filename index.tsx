
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, 
  LayoutDashboard, 
  Menu,
  Settings,
  LogOut,
  ShieldCheck,
  ArrowRight,
  FileText,
  CalendarDays,
  History,
  CreditCard,
  Globe,
  MapPinned,
  UserPlus,
  Briefcase,
  HelpCircle,
  Moon,
  Sun,
  Languages,
  Package,
  Activity,
  Bell,
  Plus,
  Search,
  Sparkles,
  Cpu,
  Zap,
  CheckCircle,
  Calculator,
  Send,
  Download,
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

import { DashboardView } from './views/Dashboard';
import { SettingsView } from './views/Settings';
import { AttendanceLocationView } from './views/Attendance';
import { CompaniesView } from './views/Companies';
import { SubscriptionsView } from './views/Subscriptions';
import { PackagesView } from './views/Packages';
import { ReportsView } from './views/Reports';
import { EmployeesView } from './views/Employees';
import { PayrollView } from './views/Payroll';
import { LeavesView } from './views/Leaves';
import { AttendanceMainView } from './views/AttendanceMain';
import { translations } from './i18n';
import { API_BASE_URL } from './constants';

function App() {
  const [user, setUser] = useState<{ role: 'superadmin' } | null>(() => {
    const saved = localStorage.getItem('beattend_admin_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const t = translations[lang];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const session = { role: 'superadmin' };
        setUser(session);
        localStorage.setItem('beattend_admin_session', JSON.stringify(session));
      } else {
        setLoginError(data.message || (lang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Incorrect username or password'));
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(lang === 'ar' ? 'تعذر الاتصال بالخادم' : 'Could not connect to the server');
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050B1F] flex items-center justify-center p-6 font-sans relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Colorful background blobs for login screen */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[120px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-[#06B6D4]/10 blur-[100px]"></div>
        </div>

        <div className="w-full max-w-md glass-panel rounded-3xl p-10 text-center space-y-6 border border-white/5 shadow-2xl animate-in fade-in duration-500 relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center bg-white shadow-[inset_1px_1px_0px_rgba(255,255,255,0.05),4px_4px_10px_rgba(0,0,0,0.3)]">
              <img src="/logo.jpg" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">be <span className="text-[#06B6D4] drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">attend</span></h1>
              <p className="text-slate-400 text-[10px] font-bold tracking-wide">{lang === 'ar' ? 'نظام الحضور والانصراف الذكي' : 'Smart Attendance System'}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-right">
              {loginError && (
                <div className="p-3 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl text-center border border-red-500/20 animate-in shake duration-300">
                  {loginError}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#06B6D4] uppercase tracking-wider block">
                  {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: admin' : 'e.g. admin'}
                  className={`w-full px-4 py-3 glass-input rounded-xl text-xs font-bold transition-all ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#06B6D4] uppercase tracking-wider block">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={lang === 'ar' ? '••••••••' : '••••••••'}
                  className={`w-full px-4 py-3 glass-input rounded-xl text-xs font-bold transition-all ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`}
                />
              </div>

              <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white hover:brightness-110 shadow-lg shadow-[#7C3AED]/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (lang === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (lang === 'ar' ? 'دخول النظام' : 'Enter System')}
                {!loginLoading && <ArrowRight size={16} className={lang === 'ar' ? '' : 'rotate-180'} />}
              </button>
            </form>

            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="text-[10px] font-bold text-slate-400 hover:text-[#06B6D4] transition-colors uppercase tracking-widest mt-2 block mx-auto">
              {lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { section: t.overview.toUpperCase(), items: [
      { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
      { id: 'payroll', label: t.payroll, icon: CreditCard },
      { id: 'leaves', label: lang === 'ar' ? 'الإجازات' : 'Leaves', icon: CalendarDays },
      { id: 'employees', label: t.employees, icon: Users },
      { id: 'attendance', label: t.attendance, icon: History },
    ]},
    { section: t.management.toUpperCase(), items: [
      { id: 'companies', label: t.companies, icon: Globe },
      { id: 'subscriptions', label: t.subscriptions, icon: ShieldCheck },
      { id: 'packages', label: t.packages, icon: Package },
      { id: 'reports', label: t.reports, icon: Activity },
      { id: 'locations', label: t.locations, icon: MapPinned },
      { id: 'jobs', label: t.jobs, icon: Briefcase },
      { id: 'candidates', label: t.candidates, icon: UserPlus },
      { id: 'calendar', label: t.calendar, icon: CalendarDays },
    ]},
    { section: t.support.toUpperCase(), items: [
      { id: 'help', label: t.help, icon: HelpCircle },
      { id: 'settings', label: t.settings, icon: Settings },
    ]}
  ];

  return (
    <div className="flex h-screen bg-transparent text-gray-100 font-sans overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Quick Actions Backdrop Overlay */}
      {isQuickActionsOpen && (
        <div 
          onClick={() => setIsQuickActionsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 z-50 flex flex-col p-6 w-72 bg-[#0B1633]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out border-white/5 shadow-2xl h-full
        lg:static lg:h-auto lg:my-6 lg:w-64 lg:bg-transparent lg:border-white/5 lg:translate-x-0 lg:rounded-3xl lg:shadow-2xl
        ${lang === 'ar' ? 'right-0 border-l lg:mr-6 lg:border-l' : 'left-0 border-r lg:ml-6 lg:border-r'}
        ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center shadow-[inset_1px_1px_0px_rgba(255,255,255,0.05),4px_4px_10px_rgba(0,0,0,0.3)]">
              <img src="/logo.jpg" className="w-full h-full object-cover opacity-85" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">be <span className="text-[#06B6D4] drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">attend</span></span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
          {menuItems.map((section) => (
            <div key={section.section} className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-400 tracking-wider px-2 uppercase">{section.section}</h3>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    activeTab === item.id 
                    ? 'bg-gradient-to-r from-[#7C3AED]/20 to-[#06B6D4]/10 text-white border-[#7C3AED]/35 shadow-[0_4px_15px_rgba(124,58,237,0.15),inset_0_1px_0px_rgba(255,255,255,0.15)]' 
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-[#06B6D4] drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
          <button onClick={() => { setLang(lang === 'ar' ? 'en' : 'ar'); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 font-semibold hover:text-white hover:bg-white/5 rounded-xl border border-transparent transition-all">
            <Languages size={18} />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <div className="flex bg-slate-900/60 border border-white/10 p-1 rounded-xl">
            <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex justify-center py-2 rounded-lg text-slate-400 hover:text-white ${!isDarkMode ? 'bg-white/10 text-white shadow-sm font-bold' : ''}`}><Sun size={16} /></button>
            <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex justify-center py-2 rounded-lg text-slate-400 hover:text-white ${isDarkMode ? 'bg-white/10 text-white shadow-sm font-bold' : ''}`}><Moon size={16} /></button>
          </div>
          <button onClick={() => { setUser(null); localStorage.removeItem('beattend_admin_session'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 font-semibold hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-transparent transition-all">
            <LogOut size={18} />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* Top Navigation Bar */}
        <header className="h-20 glass-panel mt-4 mx-4 lg:mt-6 lg:mx-6 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 flex-1 max-w-[200px] sm:max-w-xs md:max-w-md lg:w-96">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-350 hover:text-white hover:bg-white/10 transition-all shadow-md shrink-0"
              title={lang === 'ar' ? 'القائمة' : 'Menu'}
            >
              <Menu size={18} />
            </button>
            <div className="relative w-full">
              <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-2.5 text-slate-400`} size={16} />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'البحث الذكي...' : 'Smart search...'}
                className={`w-full py-2 text-xs font-bold rounded-xl glass-input transition-all ${lang === 'ar' ? 'pl-4 pr-10 text-right' : 'pr-4 pl-10 text-left'}`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Quick Actions toggle button for screens < xl */}
            <button 
              onClick={() => setIsQuickActionsOpen(true)}
              className="xl:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-350 hover:text-white hover:bg-white/10 transition-all shadow-lg shrink-0"
              title={lang === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
            >
              <Zap size={18} className="text-[#06B6D4]" />
            </button>

            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-350 hover:text-white hover:bg-white/10 transition-all shadow-lg">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse"></span>
            </button>
            
            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
            
            <div className="flex items-center gap-3.5">
               <div className={`hidden sm:block ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs font-bold text-white">Scarlette !</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'مدير النظام' : 'SYSTEM ADMIN'}</p>
               </div>
               <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#7C3AED]/40 shadow-[0_0_10px_rgba(124,58,237,0.3)] shrink-0">
                 <img src="https://ui-avatars.com/api/?name=Scarlette&background=7C3AED&color=fff" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-transparent">
          {activeTab === 'dashboard' && <DashboardView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'companies' && <CompaniesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'subscriptions' && <SubscriptionsView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'packages' && <PackagesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'reports' && <ReportsView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'employees' && <EmployeesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'payroll' && <PayrollView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'leaves' && <LeavesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'attendance' && <AttendanceMainView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'locations' && <AttendanceLocationView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'settings' && <SettingsView isDarkMode={isDarkMode} lang={lang} />}
        </div>
      </main>

      {/* Right-Side Quick Actions Panel */}
      <aside className={`
        fixed inset-y-0 z-50 flex flex-col gap-6 p-6 w-80 bg-[#0B1633]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out border-white/5 shadow-2xl h-full overflow-y-auto
        xl:static xl:h-auto xl:w-80 xl:bg-transparent xl:border-white/5 xl:translate-x-0 xl:rounded-3xl xl:shadow-2xl
        ${lang === 'ar' ? 'left-0 border-r xl:ml-6 lg:border-r' : 'right-0 border-l xl:mr-6 lg:border-l'}
        ${isQuickActionsOpen ? 'translate-x-0' : (lang === 'ar' ? '-translate-x-full xl:translate-x-0' : 'translate-x-full xl:translate-x-0')}
      `}>
        {activeTab === 'payroll' ? (
          <>
            {/* 1. Quick Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                  {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {lang === 'ar' ? 'التحكم السريع في مسيرات الرواتب' : 'Manage payroll runs'}
                </p>
              </div>
              <button 
                onClick={() => setIsQuickActionsOpen(false)}
                className="xl:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  const event = new CustomEvent('payroll-action', { detail: 'calculate' });
                  window.dispatchEvent(event);
                  setIsQuickActionsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all text-center space-y-2 group shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  <Calculator size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-200">{lang === 'ar' ? 'احتساب مسير' : 'Calc Payroll'}</span>
              </button>

              <button 
                onClick={() => {
                  const event = new CustomEvent('payroll-action', { detail: 'create' });
                  window.dispatchEvent(event);
                  setIsQuickActionsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all text-center space-y-2 group shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  <Plus size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-200">{lang === 'ar' ? 'إنشاء مسير' : 'Create Run'}</span>
              </button>

              <button 
                onClick={() => {
                  const event = new CustomEvent('payroll-action', { detail: 'export-bank' });
                  window.dispatchEvent(event);
                  setIsQuickActionsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all text-center space-y-2 group shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  <ArrowUpRight size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-200">{lang === 'ar' ? 'تصدير للبنك' : 'Bank Export'}</span>
              </button>

              <button 
                onClick={() => {
                  const event = new CustomEvent('payroll-action', { detail: 'import-attendance' });
                  window.dispatchEvent(event);
                  setIsQuickActionsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all text-center space-y-2 group shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  <Download size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-200">{lang === 'ar' ? 'استيراد حضور' : 'Import Att.'}</span>
              </button>

              <button 
                onClick={() => {
                  const event = new CustomEvent('payroll-action', { detail: 'settings' });
                  window.dispatchEvent(event);
                  setIsQuickActionsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all text-center space-y-2 group shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  <Settings size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-200">{lang === 'ar' ? 'قواعد الرواتب' : 'Rules Setup'}</span>
              </button>

              <button 
                onClick={() => {
                  const event = new CustomEvent('payroll-action', { detail: 'report' });
                  window.dispatchEvent(event);
                  setIsQuickActionsOpen(false);
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all text-center space-y-2 group shadow-md"
              >
                <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  <FileText size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-200">{lang === 'ar' ? 'تقرير الرواتب' : 'Runs Report'}</span>
              </button>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* 2. Payroll Status Timeline */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'حالة الرواتب' : 'Payroll Status'}</h4>
              <div className="space-y-3.5 pr-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span className="text-slate-350 font-bold">{lang === 'ar' ? 'تم احتساب' : 'Calculated'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">23/07/2025</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span className="text-slate-350 font-bold">{lang === 'ar' ? 'آخر اعتماد' : 'Last Approved'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">23/07/2025</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span className="text-slate-350 font-bold">{lang === 'ar' ? 'آخر تصدير للبنك' : 'Last Bank Export'}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">23/07/2025</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* 3. Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'التنبيهات' : 'Alerts'}</h4>
                <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">{lang === 'ar' ? 'عرض الكل' : 'View All'}</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    <AlertCircle size={14} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <p className="text-[10px] font-bold text-slate-200">{lang === 'ar' ? '8 مسيرات قيد الاعتماد' : '8 payrolls pending approval'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <Users size={14} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <p className="text-[10px] font-bold text-slate-200">{lang === 'ar' ? '12 موظف بدون عقد' : '12 employees without contracts'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <p className="text-[10px] font-bold text-slate-200">{lang === 'ar' ? '5 عهود تنتهي قريباً' : '5 agreements expiring soon'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <Clock size={14} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <p className="text-[10px] font-bold text-slate-200">{lang === 'ar' ? '3 سلف متأخرة السداد' : '3 overdue loans'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* 4. Help Section */}
            <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-3 text-[10px]">
              <HelpCircle className="text-[#06B6D4] shrink-0 mt-0.5" size={16} />
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <h5 className="font-black text-white">{lang === 'ar' ? 'المساعدة' : 'Help & Support'}</h5>
                <p className="font-bold text-slate-200 mt-1">{lang === 'ar' ? 'دليل استخدام الرواتب' : 'Payroll User Guide'}</p>
                <p className="text-slate-400 mt-0.5">{lang === 'ar' ? 'تعرف على كيفية إدارة مسيرات الرواتب' : 'Learn how to manage payroll sheets.'}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                  {lang === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {lang === 'ar' ? 'التحكم السريع في لوحة النظام' : 'Manage system operations'}
                </p>
              </div>
              <button 
                onClick={() => setIsQuickActionsOpen(false)}
                className="xl:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-2.5">
              <button 
                onClick={() => {
                  setActiveTab('employees');
                  setIsQuickActionsOpen(false);
                }} 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-[#7C3AED]/30 transition-all group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center group-hover:bg-[#7C3AED]/20 transition-all shadow-[0_0_8px_rgba(124,58,237,0.2)]">
                    <UserPlus size={16} />
                  </div>
                  <span className="text-xs font-bold">{lang === 'ar' ? 'إضافة موظف جديد' : 'Add Employee'}</span>
                </div>
                <ArrowRight size={14} className={`text-slate-400 group-hover:text-white transition-all transform group-hover:translate-x-0.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              <button 
                onClick={() => {
                  setActiveTab('companies');
                  setIsQuickActionsOpen(false);
                }} 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-[#06B6D4]/30 transition-all group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                    <Globe size={16} />
                  </div>
                  <span className="text-xs font-bold">{lang === 'ar' ? 'تسجيل شركة جديدة' : 'Add Company'}</span>
                </div>
                <ArrowRight size={14} className={`text-slate-400 group-hover:text-white transition-all transform group-hover:translate-x-0.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              <button 
                onClick={() => {
                  setActiveTab('locations');
                  setIsQuickActionsOpen(false);
                }} 
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-[#7C3AED]/30 transition-all group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center group-hover:bg-[#7C3AED]/20 transition-all shadow-[0_0_8px_rgba(124,58,237,0.2)]">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-xs font-bold">{lang === 'ar' ? 'ضبط موقع الفرع' : 'Set Branch Location'}</span>
                </div>
                <ArrowRight size={14} className={`text-slate-400 group-hover:text-white transition-all transform group-hover:translate-x-0.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* System Health */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'حالة النظام' : 'System Health'}</h4>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {lang === 'ar' ? 'متصل' : 'Online'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cpu size={14} className="text-slate-400" />
                    {lang === 'ar' ? 'استجابة الخادم' : 'Server Response'}
                  </span>
                  <span className="font-bold text-slate-200">45ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap size={14} className="text-slate-400" />
                    {lang === 'ar' ? 'مزامنة السجلات' : 'DB Sync Status'}
                  </span>
                  <span className="font-bold text-slate-200">100%</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* Recent Activities Feed */}
            <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">{lang === 'ar' ? 'سجل العمليات الأخير' : 'Recent Activities'}</h4>
              
              <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-1" dir="ltr">
                <div className={`flex gap-3 text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <div className="w-6 h-6 rounded-full bg-white/5 text-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5 border border-white/5 shadow-sm">
                    <CheckCircle size={12} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{lang === 'ar' ? 'تحديث رواتب شهر يونيو' : 'June salaries updated'}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{lang === 'ar' ? 'منذ 5 دقائق' : '5 mins ago'}</p>
                  </div>
                </div>

                <div className={`flex gap-3 text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <div className="w-6 h-6 rounded-full bg-white/5 text-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5 border border-white/5 shadow-sm">
                    <CheckCircle size={12} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{lang === 'ar' ? 'إضافة فرع مكة المكرمة' : 'Makkah branch added'}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{lang === 'ar' ? 'منذ ساعة' : '1 hr ago'}</p>
                  </div>
                </div>

                <div className={`flex gap-3 text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <div className="w-6 h-6 rounded-full bg-white/5 text-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5 border border-white/5 shadow-sm">
                    <CheckCircle size={12} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">{lang === 'ar' ? 'التحقق من نطاق شركة الحلول' : 'Solutions geofence checked'}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{lang === 'ar' ? 'منذ 4 ساعات' : '4 hrs ago'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
