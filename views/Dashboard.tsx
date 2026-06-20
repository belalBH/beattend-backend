
import React from 'react';
import { 
  Users, 
  UserMinus, 
  UserPlus, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Eye, 
  MoreVertical,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react';
import { translations } from '../i18n';

export const DashboardView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        <div className="xl:col-span-3 bg-[#E8F7F5] rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="mb-6 relative z-10">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/female-office-worker-working-on-laptop-illustration-download-in-svg-png-gif-formats--desk-employee-people-pack-business-illustrations-4860161.png" alt="Welcome" className="w-40 h-40 object-contain" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase">{t.welcome}</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            {t.morning_msg}
          </p>
          <button className="bg-[#15385E] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#15385E]/20 hover:bg-[#17AE9F] transition-all">
            {t.review}
          </button>
        </div>

        <div className="xl:col-span-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-2xl font-bold text-gray-900">99</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.total_present}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-[#15385E] transition-colors">
                <Users size={20} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-2xl font-bold text-gray-900">15</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.total_absent}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-red-400 transition-colors">
                <UserMinus size={20} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                <p className="text-2xl font-bold text-gray-900">06</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.on_leave}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-orange-400 transition-colors">
                <UserPlus size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-gray-900">{lang === 'ar' ? 'أداء الفريق' : 'Team Performance'}</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                  <span className="text-[10px] font-bold text-gray-500">{lang === 'ar' ? 'فريق التصميم' : 'Designer Team'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#15385E]"></div>
                  <span className="text-[10px] font-bold text-gray-500">{lang === 'ar' ? 'فريق التطوير' : 'Developer Team'}</span>
                </div>
              </div>
            </div>
            <div className="relative h-48 w-full">
              <svg className="w-full h-full" viewBox="0 0 800 200">
                <path d="M0,150 Q100,140 200,160 T400,100 T600,120 T800,50" fill="none" stroke="#15385E" strokeWidth="3" />
                <path d="M0,120 Q100,130 200,110 T400,140 T600,90 T800,130" fill="none" stroke="#1F2937" strokeWidth="3" />
                {[0, 50, 100, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#F3F4F6" strokeWidth="1" />
                ))}
              </svg>
              <div className="flex justify-between mt-4 px-2">
                {lang === 'ar' 
                  ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'].map(m => <span key={m} className="text-[8px] font-bold text-gray-400 uppercase">{m}</span>)
                  : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m} className="text-[10px] font-bold text-gray-400 uppercase">{m}</span>)
                }
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-900 self-start mb-8">{lang === 'ar' ? 'إجمالي الموظفين' : 'Total Employee'}</h3>
          <div className="relative w-40 h-40 mb-10">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#F3F4F6" strokeWidth="4" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#15385E" strokeWidth="4" strokeDasharray="60, 100" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#17AE9F" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-60" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className="text-2xl font-black text-gray-900">85%</span>
            </div>
          </div>
          <div className="w-full space-y-4">
            {[
              { label: lang === 'ar' ? 'مهندس برمجيات' : 'Software engineer', val: 50, color: 'bg-[#15385E]' },
              { label: lang === 'ar' ? 'مصمم واجهات' : 'UI/UX Designer', val: 28, color: 'bg-[#17AE9F]' },
              { label: lang === 'ar' ? 'محلل بيانات' : 'Data Analyst', val: 25, color: 'bg-[#34D399]' }
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-[10px] font-bold">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                  <span className="text-gray-500">{item.label}</span>
                </div>
                <span className="text-gray-900">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
