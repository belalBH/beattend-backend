import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Banknote,
  RefreshCw,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { translations } from '../i18n';

export const DashboardView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  
  const [stats, setStats] = useState({
    companiesCount: 0,
    employeesCount: 0,
    todayAttendanceCount: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    monthlyRevenues: 0
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error loading dashboard stats:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const todayDateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'ar' ? 'لوحة التحكم العامة' : 'General Dashboard'}
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {lang === 'ar' ? 'نظرة عامة شاملة وإحصائيات حية لجميع الشركات والاشتراكات والموظفين' : 'Comprehensive overview and live statistics of all companies, subscriptions, and employees.'}
          </p>
        </div>
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600">
            <Calendar size={14} className="text-[#17AE9F]" />
            <span>{todayDateStr}</span>
          </div>
          <button 
            onClick={fetchStats}
            disabled={isRefreshing}
            className={`p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={lang === 'ar' ? 'تحديث الإحصائيات' : 'Refresh stats'}
          >
            <RefreshCw size={16} className={`text-[#15385E] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. عدد الشركات */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300">
          <div className="space-y-1">
            <p className="text-3xl font-black text-gray-900">
              {loading ? '...' : stats.companiesCount}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'عدد الشركات' : 'Number of Companies'}
            </p>
            <p className="text-[10px] text-[#17AE9F] font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              <span>{lang === 'ar' ? 'مؤسسات مسجلة بالنظام' : 'Registered corporate tenants'}</span>
            </p>
          </div>
          <div className="p-4 bg-[#EBF2FA] rounded-2xl text-[#15385E] group-hover:bg-[#15385E] group-hover:text-white transition-all duration-300">
            <Building2 size={24} />
          </div>
        </div>

        {/* 2. عدد الموظفين الكلي */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300">
          <div className="space-y-1">
            <p className="text-3xl font-black text-gray-900">
              {loading ? '...' : stats.employeesCount}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'عدد الموظفين الكلي' : 'Total Employees'}
            </p>
            <p className="text-[10px] text-[#17AE9F] font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              <span>{lang === 'ar' ? 'حسابات نشطة بالتطبيق' : 'Active mobile app accounts'}</span>
            </p>
          </div>
          <div className="p-4 bg-[#E8F7F5] rounded-2xl text-[#17AE9F] group-hover:bg-[#17AE9F] group-hover:text-white transition-all duration-300">
            <Users size={24} />
          </div>
        </div>

        {/* 3. الحضور اليوم لجميع الشركات */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300">
          <div className="space-y-1">
            <p className="text-3xl font-black text-gray-900">
              {loading ? '...' : stats.todayAttendanceCount}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'الحضور اليوم لجميع الشركات' : 'Today\'s Total Attendance'}
            </p>
            <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
              <Clock size={12} />
              <span>{lang === 'ar' ? 'عمليات بصم ناجحة اليوم' : 'Successful check-ins today'}</span>
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <Clock size={24} />
          </div>
        </div>

        {/* 4. الاشتراكات النشطة */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300">
          <div className="space-y-1">
            <p className="text-3xl font-black text-gray-900">
              {loading ? '...' : stats.activeSubscriptions}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
            </p>
            <p className="text-[10px] text-[#17AE9F] font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 size={12} />
              <span>{lang === 'ar' ? 'سارية الصلاحية والخدمة' : 'Valid service access'}</span>
            </p>
          </div>
          <div className="p-4 bg-[#E8F7F5] rounded-2xl text-[#17AE9F] group-hover:bg-[#17AE9F] group-hover:text-white transition-all duration-300">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* 5. الاشتراكات المنتهية */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300">
          <div className="space-y-1">
            <p className="text-3xl font-black text-red-500">
              {loading ? '...' : stats.expiredSubscriptions}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'الاشتراكات المنتهية' : 'Expired Subscriptions'}
            </p>
            <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-1">
              <XCircle size={12} />
              <span>{lang === 'ar' ? 'تحتاج تجديد فوري' : 'Requires immediate renewal'}</span>
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
            <XCircle size={24} />
          </div>
        </div>

        {/* 6. الإيرادات الشهرية */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all hover:-translate-y-0.5 duration-300">
          <div className="space-y-1">
            <p className="text-3xl font-black text-gray-900">
              {loading ? '...' : `${stats.monthlyRevenues.toLocaleString()}`} <span className="text-xs font-black text-gray-500">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenues'}
            </p>
            <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              <span>{lang === 'ar' ? 'معدل الدخل المتوقع شهرياً' : 'Expected monthly rate'}</span>
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <Banknote size={24} />
          </div>
        </div>

      </div>

      {/* Visual Analytics / Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100/70 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <div>
              <h3 className="text-sm font-black text-[#15385E]">
                {lang === 'ar' ? 'مخطط الإيرادات السنوية' : 'Annual Revenue Trend'}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                {lang === 'ar' ? 'تحليل مسار الدخل الشهري بناءً على نمو الشركات والمشتركين' : 'Monthly income projections based on subscription metrics.'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#15385E]"></div>
                <span>{lang === 'ar' ? 'الإيرادات الفعلية' : 'Actual Revenues'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#17AE9F]"></div>
                <span>{lang === 'ar' ? 'مستهدف النمو' : 'Growth Target'}</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-56 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              {[0, 50, 100, 150].map(y => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#F9FAFB" strokeWidth="1.5" />
              ))}
              
              {/* Curve 1 (Actual Revenue) */}
              <path 
                d="M0,170 C100,165 150,140 250,145 C350,150 400,105 500,110 C600,115 650,85 800,60" 
                fill="none" 
                stroke="#15385E" 
                strokeWidth="4.5" 
                strokeLinecap="round"
              />
              
              {/* Curve 2 (Target) */}
              <path 
                d="M0,160 C100,150 150,120 250,120 C350,120 400,85 500,80 C600,75 650,55 800,30" 
                fill="none" 
                stroke="#17AE9F" 
                strokeWidth="2.5" 
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between mt-4 px-2">
              {lang === 'ar' 
                ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'].map(m => <span key={m} className="text-[9px] font-bold text-gray-400">{m}</span>)
                : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m} className="text-[10px] font-bold text-gray-400">{m}</span>)
              }
            </div>
          </div>
        </div>

        {/* Subscription Ratio Donut Chart */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-gray-100/70 shadow-sm flex flex-col justify-between items-center text-center space-y-6">
          <div className="w-full text-right border-b border-gray-50 pb-4">
            <h3 className="text-sm font-black text-[#15385E]">
              {lang === 'ar' ? 'نسبة فاعلية الاشتراكات' : 'Subscription Status'}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium">
              {lang === 'ar' ? 'التوزيع المئوي للشركات المفعلة والمنتهية' : 'Distribution ratio of corporate tenant status.'}
            </p>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center">
            {stats.companiesCount > 0 ? (
              <>
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#F9FAFB" strokeWidth="5.5" />
                  {/* Active segment */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#17AE9F" 
                    strokeWidth="5.5" 
                    strokeDasharray={`${(stats.activeSubscriptions / stats.companiesCount) * 100}, 100`} 
                  />
                  {/* Expired segment */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="#EF4444" 
                    strokeWidth="5.5" 
                    strokeDasharray={`${(stats.expiredSubscriptions / stats.companiesCount) * 100}, 100`} 
                    strokeDashoffset={`-${(stats.activeSubscriptions / stats.companiesCount) * 100}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">
                    {stats.companiesCount > 0 ? Math.round((stats.activeSubscriptions / stats.companiesCount) * 100) : 0}%
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    {lang === 'ar' ? 'نشط' : 'Active'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-gray-300 font-semibold text-xs">{lang === 'ar' ? 'لا توجد بيانات' : 'No data'}</div>
            )}
          </div>

          <div className="w-full space-y-3 pt-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#17AE9F]"></div>
                <span className="text-gray-500">{lang === 'ar' ? 'نشط' : 'Active'}</span>
              </div>
              <span className="text-gray-900">{stats.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-gray-500">{lang === 'ar' ? 'منتهي' : 'Expired'}</span>
              </div>
              <span className="text-gray-900">{stats.expiredSubscriptions}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
