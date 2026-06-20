
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
  Languages
} from 'lucide-react';

import { DashboardView } from './views/Dashboard';
import { SettingsView } from './views/Settings';
import { AttendanceLocationView } from './views/Attendance';
import { CompaniesView } from './views/Companies';
import { EmployeesView } from './views/Employees';
import { translations } from './i18n';

function App() {
  const [user, setUser] = useState<{ role: 'superadmin' } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-12 text-center space-y-8 border border-gray-100">
            <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-lg border-2 border-[#17AE9F] bg-white flex items-center justify-center">
              <img src="/logo.jpg" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#15385E]">be <span className="text-[#17AE9F]">attend</span></h1>
              <p className="text-gray-500 text-sm">{lang === 'ar' ? 'نظام الحضور والانصراف الذكي' : 'Smart Attendance System'}</p>
            </div>
           <button onClick={() => setUser({ role: 'superadmin' })} className="w-full py-4 bg-[#15385E] text-white rounded-xl font-bold shadow-lg hover:bg-[#17AE9F] transition-all flex items-center justify-center gap-2">
            {lang === 'ar' ? 'دخول النظام' : 'Enter System'} <ArrowRight size={18} className={lang === 'ar' ? '' : 'rotate-180'} />
           </button>
           <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="text-xs font-bold text-gray-400 hover:text-[#15385E] transition-colors uppercase tracking-widest">
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
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#111827] text-white' : 'bg-[#F8F9FA] text-gray-900'} font-sans`}>
      {/* Sidebar */}
      <aside className={`w-64 ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white border-gray-200'} ${lang === 'ar' ? 'border-l' : 'border-r'} flex flex-col p-6 transition-colors duration-300`}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#17AE9F] bg-white flex items-center justify-center">
            <img src="/logo.jpg" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#15385E]">be <span className="text-[#17AE9F]">attend</span></span>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
          {menuItems.map((section) => (
            <div key={section.section} className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-widest px-2 uppercase">{section.section}</h3>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id 
                    ? 'bg-[#E8F7F5] text-[#17AE9F]' 
                    : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-all">
            <Languages size={18} />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <div className="flex bg-gray-50 p-1 rounded-xl">
            <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex justify-center py-2 rounded-lg ${!isDarkMode ? 'bg-white shadow-sm' : ''}`}><Sun size={16} /></button>
            <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex justify-center py-2 rounded-lg ${isDarkMode ? 'bg-white shadow-sm text-gray-900' : ''}`}><Moon size={16} /></button>
          </div>
          <button onClick={() => setUser(null)} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-transparent flex items-center justify-between px-10 shrink-0">
          <h2 className="text-2xl font-bold capitalize">{t[activeTab as keyof typeof t] || activeTab}</h2>
          <div className="flex items-center gap-4">
             <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-sm font-bold">Scarlette !</p>
                <p className="text-[10px] text-gray-400">Default / Home</p>
             </div>
             <img src="https://ui-avatars.com/api/?name=Scarlette&background=17AE9F&color=fff" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 pt-0">
          {activeTab === 'dashboard' && <DashboardView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'companies' && <CompaniesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'employees' && <EmployeesView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'locations' && <AttendanceLocationView isDarkMode={isDarkMode} lang={lang} />}
          {activeTab === 'settings' && <SettingsView isDarkMode={isDarkMode} lang={lang} />}
        </div>
      </main>

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
