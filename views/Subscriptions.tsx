import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Package, 
  Building2, 
  Search, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { Company } from '../types';
import { API_BASE_URL } from '../constants';

export const SubscriptionsView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'expired' | 'renewals'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Renewal modal states
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPackage, setSelectedPackage] = useState('الأساسية');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (e) {
      console.error("Error loading companies in subscriptions view:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenRenewModal = (company: Company) => {
    setSelectedCompany(company);
    setSelectedPackage(company.package || 'الأساسية');
    // Default to 1 year from today
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setNewExpiryDate(nextYear.toISOString().split('T')[0]);
    setShowRenewModal(true);
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package: selectedPackage,
          expiryDate: newExpiryDate,
          status: 'نشط' // Re-activate if it was suspended or expired
        }),
      });

      if (response.ok) {
        setShowRenewModal(false);
        setSelectedCompany(null);
        fetchCompanies();
      } else {
        alert(lang === 'ar' ? 'فشل تجديد الاشتراك' : 'Failed to renew subscription');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend API');
    }
  };

  // Helper calculations
  const now = new Date();
  
  const activeSubs = companies.filter(c => {
    const isExpired = c.expiryDate ? new Date(c.expiryDate) < now : false;
    return !isExpired && c.status !== 'موقوف';
  });

  const expiredSubs = companies.filter(c => {
    return c.expiryDate ? new Date(c.expiryDate) < now : false;
  });

  const upcomingRenewals = companies.filter(c => {
    if (!c.expiryDate) return false;
    const expiry = new Date(c.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = expiry < now;
    return !isExpired && diffDays <= 30; // Expirations in the next 30 days
  });

  // Filter based on active tab and search term
  const getFilteredList = () => {
    let baseList: Company[] = [];
    if (activeSubTab === 'active') baseList = activeSubs;
    else if (activeSubTab === 'expired') baseList = expiredSubs;
    else baseList = upcomingRenewals;

    return baseList.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.domain && c.domain.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const currentList = getFilteredList();

  const getDaysRemaining = (expiryDateStr?: string) => {
    if (!expiryDateStr) return 0;
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Subscriptions Summary */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-3xl font-black text-[#17AE9F]">{activeSubs.length}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'الاشتراكات النشطة' : 'Active Subscriptions'}
            </p>
          </div>
          <div className="p-3.5 bg-[#E8F7F5] rounded-2xl text-[#17AE9F]">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Expired Subscriptions Summary */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-3xl font-black text-red-500">{expiredSubs.length}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'الاشتراكات المنتهية' : 'Expired Subscriptions'}
            </p>
          </div>
          <div className="p-3.5 bg-red-50 rounded-2xl text-red-500">
            <XCircle size={24} />
          </div>
        </div>

        {/* Renewals Soon Summary */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-3xl font-black text-amber-500">{upcomingRenewals.length}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'ar' ? 'تجديدات قريبة (خلال 30 يوم)' : 'Upcoming Renewals (30 Days)'}
            </p>
          </div>
          <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-500">
            <Clock size={24} />
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100/70 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl overflow-x-auto w-full xl:w-auto">
          {[
            { id: 'active', labelAr: 'الاشتراكات النشطة', labelEn: 'Active Subscriptions', count: activeSubs.length, activeColor: 'bg-[#E8F7F5] text-[#15385E]' },
            { id: 'expired', labelAr: 'الاشتراكات المنتهية', labelEn: 'Expired Subscriptions', count: expiredSubs.length, activeColor: 'bg-red-50 text-red-600' },
            { id: 'renewals', labelAr: 'التجديدات القريبة', labelEn: 'Upcoming Renewals', count: upcomingRenewals.length, activeColor: 'bg-amber-50 text-amber-600' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === tab.id 
                ? `${tab.activeColor} shadow-sm font-black` 
                : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-gray-100/50">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full xl:w-80 shrink-0">
          <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'البحث بالشركة أو النطاق...' : 'Search by company/domain...'} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs focus:ring-2 ring-[#15385E]/10 outline-none`} 
          />
        </div>
      </div>

      {/* Subscriptions List Container */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100/70 rounded-[2.5rem] shadow-sm">
          {lang === 'ar' ? 'جاري تحميل الاشتراكات...' : 'Loading subscriptions...'}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100/70 rounded-[2.5rem] shadow-sm space-y-4">
          <Building2 size={48} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold">
            {lang === 'ar' ? 'لا توجد اشتراكات تطابق هذا الفلتر' : 'No subscriptions matching this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentList.map((company) => {
            const daysRemaining = getDaysRemaining(company.expiryDate);
            const isExpired = company.expiryDate ? new Date(company.expiryDate) < now : false;

            return (
              <div 
                key={company.id} 
                className="bg-white border border-gray-100/70 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Company Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {company.logo ? (
                        <img src={company.logo} className="w-full h-full object-cover" alt={company.name} />
                      ) : (
                        <Building2 className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-black text-gray-900 truncate">{company.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">{company.domain || 'no-domain.com'}</p>
                    </div>
                  </div>

                  {/* Plan Information Card */}
                  <div className="bg-gray-50/50 p-4 rounded-2xl space-y-3 mb-6">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold">{lang === 'ar' ? 'الباقة الحالية' : 'Subscription Plan'}</span>
                      <span className="text-[#15385E] font-black bg-[#E8F7F5] text-[#17AE9F] px-3 py-1 rounded-lg border border-[#17AE9F]/10 flex items-center gap-1.5">
                        <Package size={12} />
                        {company.package || (lang === 'ar' ? 'الأساسية' : 'Basic')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                      <span className="text-gray-400 font-bold">{lang === 'ar' ? 'الموظفين المسجلين' : 'Registered Employees'}</span>
                      <span className="text-gray-700 font-black">{company.employees || 0} {lang === 'ar' ? 'موظف' : 'users'}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                      <span className="text-gray-400 font-bold">{lang === 'ar' ? 'تاريخ بداية الاشتراك' : 'Subscription Date'}</span>
                      <span className="text-gray-700 font-black flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        {company.startDate || '—'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                      <span className="text-gray-400 font-bold">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</span>
                      <span className={`font-black flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                        <Calendar size={12} className={isExpired ? 'text-red-500' : 'text-gray-400'} />
                        {company.expiryDate || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expiry status message & renew buttons */}
                <div className="border-t border-gray-50 pt-4 flex items-center justify-between gap-4">
                  {/* Status Text Details */}
                  {isExpired ? (
                    <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black">
                      <AlertTriangle size={14} className="animate-pulse" />
                      <span>{lang === 'ar' ? 'منتهي الصلاحية!' : 'Expired!'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black">
                      <CheckCircle2 size={14} />
                      <span>
                        {lang === 'ar' 
                          ? `متبقي ${daysRemaining} يوم` 
                          : `${daysRemaining} days left`}
                      </span>
                    </div>
                  )}

                  {/* Renew Button */}
                  <button
                    onClick={() => handleOpenRenewModal(company)}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                      isExpired 
                        ? 'bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200/50 shadow-sm shadow-red-100'
                        : 'bg-[#EBF2FA] hover:bg-[#15385E] text-[#15385E] hover:text-white border border-[#15385E]/10'
                    }`}
                  >
                    <RotateCcw size={12} />
                    <span>{lang === 'ar' ? 'تجديد الاشتراك' : 'Renew Plan'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Renew Subscription Form Modal */}
      {showRenewModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gray-50/50 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="text-[#15385E]" size={18} />
                {lang === 'ar' ? `تجديد اشتراك: ${selectedCompany.name}` : `Renew: ${selectedCompany.name}`}
              </h3>
              <button 
                onClick={() => {
                  setShowRenewModal(false);
                  setSelectedCompany(null);
                }} 
                className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRenewSubmit} className="p-6 space-y-6">
              
              {/* Package selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'اختيار باقة الاشتراك' : 'Select Subscription Package'}</label>
                <div className="grid grid-cols-3 gap-3">
                  {['الأساسية', 'المتقدمة', 'الاحترافية'].map(packOpt => {
                    const isSelected = selectedPackage === packOpt;
                    return (
                      <button
                        key={packOpt}
                        type="button"
                        onClick={() => setSelectedPackage(packOpt)}
                        className={`py-3.5 rounded-xl border text-xs font-black transition-all ${
                          isSelected 
                            ? 'border-[#17AE9F] bg-[#E8F7F5] text-[#15385E]' 
                            : 'border-gray-100 hover:border-gray-200 text-gray-500 bg-white'
                        }`}
                      >
                        {packOpt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'تاريخ انتهاء الاشتراك الجديد' : 'New Expiry Date'}</label>
                <input 
                  type="date" 
                  value={newExpiryDate} 
                  onChange={(e) => setNewExpiryDate(e.target.value)} 
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  required
                />
              </div>

              {/* Current details display */}
              <div className="bg-[#E8F7F5]/30 p-4 rounded-2xl border border-[#17AE9F]/10 text-xs space-y-1.5">
                <p className="text-gray-400 font-bold">{lang === 'ar' ? 'تفاصيل التجديد المقدرة:' : 'Estimated renewal details:'}</p>
                <p className="text-[#15385E] font-black">
                  {lang === 'ar' 
                    ? `• الشركة ستظل نشطة في النظام حتى تاريخ ${newExpiryDate}` 
                    : `• Company will remain active in the system until ${newExpiryDate}`}
                </p>
                <p className="text-[#15385E] font-black">
                  {lang === 'ar' 
                    ? `• الباقة المفعلة: ${selectedPackage}` 
                    : `• Active Package: ${selectedPackage}`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-50 flex gap-3 justify-end">
                <button type="submit" className="px-6 py-3 bg-[#15385E] text-white rounded-xl text-xs font-bold shadow-lg hover:bg-[#17AE9F] transition-all">
                  {lang === 'ar' ? 'تأكيد وتجديد الاشتراك' : 'Confirm & Renew'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowRenewModal(false);
                    setSelectedCompany(null);
                  }} 
                  className="px-6 py-3 bg-white border border-gray-100 text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
