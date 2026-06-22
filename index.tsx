
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, 
  LayoutDashboard, 
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
  CheckCircle
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
import { translations } from './i18n';
import { API_BASE_URL } from './constants';

function App() {
  const [user, setUser] = useState<{ role: 'superadmin' } | null>(() => {
    const saved = localStorage.getItem('beattend_admin_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

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
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-12 text-center space-y-6 border border-gray-100 animate-in fade-in duration-500">
            <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-lg border-2 border-[#17AE9F] bg-white flex items-center justify-center">
              <img src="/logo.jpg" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#15385E]">be <span className="text-[#17AE9F]">attend</span></h1>
              <p className="text-gray-500 text-xs">{lang === 'ar' ? 'نظام الحضور والانصراف الذكي' : 'Smart Attendance System'}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-right">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center border border-red-100 animate-in shake duration-300">
                  {loginError}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#15385E] uppercase tracking-wider block">
                  {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: admin' : 'e.g. admin'}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:border-[#17AE9F] focus:bg-white transition-all ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#15385E] uppercase tracking-wider block">
                  {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={lang === 'ar' ? '••••••••' : '••••••••'}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:border-[#17AE9F] focus:bg-white transition-all ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`}
                />
              </div>

              <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full py-4 mt-2 bg-[#15385E] text-white rounded-xl font-bold shadow-lg hover:bg-[#17AE9F] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (lang === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (lang === 'ar' ? 'دخول النظام' : 'Enter System')}
                {!loginLoading && <ArrowRight size={18} className={lang === 'ar' ? '' : 'rotate-180'} />}
              </button>
            </form>

            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="text-[10px] font-bold text-gray-400 hover:text-[#15385E] transition-colors uppercase tracking-widest mt-2 block mx-auto">
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
    <div className={`flex h-screen bg-transparent text-gray-800 font-sans overflow-hidden`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`w-64 glass-panel ${lang === 'ar' ? 'border-l' : 'border-r'} border-white/40 flex flex-col p-6 transition-all duration-300 relative z-20`}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-violet-500/20 bg-white/60 flex items-center justify-center shadow-sm">
            <img src="/logo.jpg" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">be <span className="text-violet-600">attend</span></span>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
          {menuItems.map((section) => (
            <div key={section.section} className="space-y-2">
              <h3 className="text-[10px] font-black text-gray-400 tracking-wider px-2 uppercase">{section.section}</h3>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    activeTab === item.id 
                    ? 'bg-violet-600/10 text-violet-700 border-violet-500/20 shadow-sm' 
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-white/30'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-violet-600' : ''} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-black/5 space-y-4">
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 font-semibold hover:text-gray-900 hover:bg-white/30 rounded-xl border border-transparent transition-all">
            <Languages size={18} />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <div className="flex bg-black/5 border border-black/5 p-1 rounded-xl">
            <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex justify-center py-2 rounded-lg text-gray-500 hover:text-gray-900 ${!isDarkMode ? 'bg-white shadow-sm text-gray-950' : ''}`}><Sun size={16} /></button>
            <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex justify-center py-2 rounded-lg text-gray-500 hover:text-gray-900 ${isDarkMode ? 'bg-white shadow-sm text-gray-950' : ''}`}><Moon size={16} /></button>
          </div>
          <button onClick={() => { setUser(null); localStorage.removeItem('beattend_admin_session'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 font-semibold hover:text-red-600 hover:bg-red-50/50 rounded-xl border border-transparent transition-all">
            <LogOut size={18} />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* Top Navigation Bar */}
        <header className="h-20 bg-white/40 backdrop-blur-2xl border-b border-white/40 flex items-center justify-between px-8 shrink-0 relative z-10">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className={`absolute ${lang === 'ar' ? 'right-3.5' : 'left-3.5'} top-2.5 text-gray-400`} size={16} />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'البحث الذكي عن الشركات والموظفين...' : 'Smart search companies, employees...'}
                className={`w-full py-2 text-xs font-bold rounded-xl glass-input transition-all ${lang === 'ar' ? 'pl-4 pr-10 text-right' : 'pr-4 pl-10 text-left'}`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-xl bg-white/60 border border-white/40 text-gray-500 hover:text-gray-800 hover:bg-white/80 transition-all shadow-sm">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600"></span>
            </button>
            
            <div className="h-8 w-px bg-black/5"></div>
            
            <div className="flex items-center gap-3.5">
               <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <p className="text-xs font-bold text-gray-900">Scarlette !</p>
                  <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest">{lang === 'ar' ? 'مدير النظام' : 'SYSTEM ADMIN'}</p>
               </div>
               <div className="w-10 h-10 rounded-xl overflow-hidden border border-violet-500/20 shadow-sm">
                 <img src="https://ui-avatars.com/api/?name=Scarlette&background=7C3AED&color=fff" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-transparent">
          {activeTab === 'dashboard' && <DashboardView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'companies' && <CompaniesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'subscriptions' && <SubscriptionsView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'packages' && <PackagesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'reports' && <ReportsView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'employees' && <EmployeesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'payroll' && <PayrollView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'locations' && <AttendanceLocationView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'settings' && <SettingsView isDarkMode={isDarkMode} lang={lang} />}
        </div>
      </main>

      {/* Right-Side Quick Actions Panel */}
      <aside className="w-80 glass-panel border-l border-white/40 p-6 flex flex-col gap-6 overflow-y-auto relative z-10 shrink-0">
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">
            {lang === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
          </h3>
          <p className="text-[10px] text-gray-400">
            {lang === 'ar' ? 'التحكم السريع في لوحة النظام' : 'Manage system operations'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          <button 
            onClick={() => setActiveTab('employees')} 
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/60 border border-white/40 text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:border-violet-500/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:bg-violet-500/20 transition-all">
                <UserPlus size={16} />
              </div>
              <span className="text-xs font-bold">{lang === 'ar' ? 'إضافة موظف جديد' : 'Add Employee'}</span>
            </div>
            <ArrowRight size={14} className={`text-gray-400 group-hover:text-gray-900 transition-all transform group-hover:translate-x-0.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('companies')} 
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/60 border border-white/40 text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:border-violet-500/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:bg-violet-500/20 transition-all">
                <Globe size={16} />
              </div>
              <span className="text-xs font-bold">{lang === 'ar' ? 'تسجيل شركة جديدة' : 'Add Company'}</span>
            </div>
            <ArrowRight size={14} className={`text-gray-400 group-hover:text-gray-900 transition-all transform group-hover:translate-x-0.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('locations')} 
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/60 border border-white/40 text-gray-600 hover:text-gray-900 hover:bg-white/80 hover:border-violet-500/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:bg-violet-500/20 transition-all">
                <MapPinned size={16} />
              </div>
              <span className="text-xs font-bold">{lang === 'ar' ? 'ضبط موقع الفرع' : 'Set Branch Location'}</span>
            </div>
            <ArrowRight size={14} className={`text-gray-400 group-hover:text-gray-900 transition-all transform group-hover:translate-x-0.5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="h-px bg-black/5"></div>

        {/* System Health */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'ar' ? 'حالة النظام' : 'System Health'}</h4>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {lang === 'ar' ? 'متصل' : 'Online'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/30 border border-white/40 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Cpu size={14} className="text-violet-600" />
                {lang === 'ar' ? 'استجابة الخادم' : 'Server Response'}
              </span>
              <span className="font-bold text-gray-800">45ms</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Zap size={14} className="text-violet-600" />
                {lang === 'ar' ? 'مزامنة السجلات' : 'DB Sync Status'}
              </span>
              <span className="font-bold text-gray-800">100%</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-black/5"></div>

        {/* Recent Activities Feed */}
        <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">{lang === 'ar' ? 'سجل العمليات الأخير' : 'Recent Activities'}</h4>
          
          <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-1" dir="ltr">
            <div className={`flex gap-3 text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={12} />
              </div>
              <div>
                <p className="font-bold text-gray-800">{lang === 'ar' ? 'تحديث رواتب شهر يونيو' : 'June salaries updated'}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'ar' ? 'منذ 5 دقائق' : '5 mins ago'}</p>
              </div>
            </div>

            <div className={`flex gap-3 text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={12} />
              </div>
              <div>
                <p className="font-bold text-gray-800">{lang === 'ar' ? 'إضافة فرع مكة المكرمة' : 'Makkah branch added'}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'ar' ? 'منذ ساعة' : '1 hr ago'}</p>
              </div>
            </div>

            <div className={`flex gap-3 text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle size={12} />
              </div>
              <div>
                <p className="font-bold text-gray-800">{lang === 'ar' ? 'التحقق من نطاق شركة الحلول' : 'Solutions geofence checked'}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'ar' ? 'منذ 4 ساعات' : '4 hrs ago'}</p>
              </div>
            </div>
          </div>
        </div>
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
