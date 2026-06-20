import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Building2, 
  Users, 
  X, 
  CalendarDays, 
  Search, 
  Filter, 
  Briefcase, 
  FileText, 
  Clock, 
  Percent, 
  ShieldCheck 
} from 'lucide-react';
import { translations } from '../i18n';
import { Company } from '../types';
import { API_BASE_URL } from '../constants';

export const CompaniesView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [employeesCount, setEmployeesCount] = useState('10');
  const [industry, setIndustry] = useState(lang === 'ar' ? 'التقنية' : 'Technology');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/companies`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (e) {
      console.error("Error fetching companies:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !domain) {
      alert(lang === 'ar' ? 'الاسم والنطاق مطلوبان' : 'Name and Domain are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          domain: domain.trim().toLowerCase(),
          crNumber,
          taxNumber,
          employees: parseInt(employeesCount) || 0,
          industry,
          startDate,
          expiryDate,
          status: 'نشط'
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        // Reset states
        setName('');
        setDomain('');
        setCrNumber('');
        setTaxNumber('');
        setEmployeesCount('10');
        fetchCompanies();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save company');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend API');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.domain && c.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
          <input 
            type="text" 
            placeholder={t.search_companies} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/20 outline-none shadow-sm`} 
          />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#15385E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#15385E]/20 hover:bg-[#17AE9F] transition-all">
            <Plus size={18} /> {t.add_company}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">{lang === 'ar' ? 'جاري التحميل...' : 'Loading companies...'}</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p>{lang === 'ar' ? 'لا توجد شركات مطابقة' : 'No companies found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const isExpired = company.expiryDate ? new Date(company.expiryDate) < new Date() : false;
            return (
              <div key={company.id} className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <img src={company.logo} className="w-12 h-12 rounded-2xl border border-gray-100 object-cover" alt={company.name} />
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${isExpired ? 'bg-red-50 text-red-500' : 'bg-[#E8F7F5] text-[#17AE9F]'}`}>
                      {isExpired ? t.expired : t.active}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                    <p className="text-xs text-[#17AE9F] font-bold flex items-center gap-1.5 mt-1">
                      <Globe size={13} /> {company.domain || 'no-domain.com'}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-2">
                      {company.industry} • CR: {company.crNumber || '—'}
                    </p>
                    {company.taxNumber && (
                      <p className="text-[10px] text-gray-400 font-medium mt-1">
                        {lang === 'ar' ? 'الرقم الضريبي:' : 'VAT:'} {company.taxNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50 text-left">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{t.employees}</p>
                      <p className="text-sm font-bold text-gray-700">{company.employees}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{t.expiry}</p>
                      <p className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>{company.expiryDate || '—'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <span className="text-[9px] text-gray-400 font-bold">
                      {lang === 'ar' ? `منذ: ${company.startDate || '—'}` : `Since: ${company.startDate || '—'}`}
                    </span>
                    <button className="text-[#15385E] text-xs font-bold hover:underline">{t.view}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 bg-gray-50/50 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="text-[#15385E]" size={20} />
                {lang === 'ar' ? 'إضافة شركة جديدة' : 'Add New Company'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCompany} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'اسم الشركة' : 'Company Name'}</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={lang === 'ar' ? 'مثال: شركة الحلول المتقدمة' : 'e.g. Solutions Advanced'} 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'نطاق الشركة (Domain)' : 'Company Domain'}</label>
                  <input 
                    type="text" 
                    value={domain} 
                    onChange={(e) => setDomain(e.target.value)} 
                    placeholder="solutions.sa" 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'السجل التجاري (CR)' : 'Commercial Register (CR)'}</label>
                  <input 
                    type="text" 
                    value={crNumber} 
                    onChange={(e) => setCrNumber(e.target.value)} 
                    placeholder="1010XXXXXX" 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'الرقم الضريبي (VAT)' : 'Tax Number (VAT)'}</label>
                  <input 
                    type="text" 
                    value={taxNumber} 
                    onChange={(e) => setTaxNumber(e.target.value)} 
                    placeholder="300000000000003" 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'عدد الموظفين' : 'Employees Count'}</label>
                  <input 
                    type="number" 
                    value={employeesCount} 
                    onChange={(e) => setEmployeesCount(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'مجال العمل (الصناعة)' : 'Industry'}</label>
                  <select 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm outline-none"
                  >
                    <option>{lang === 'ar' ? 'التقنية' : 'Technology'}</option>
                    <option>{lang === 'ar' ? 'التجزئة' : 'Retail'}</option>
                    <option>{lang === 'ar' ? 'الصحة' : 'Healthcare'}</option>
                    <option>{lang === 'ar' ? 'التعليم' : 'Education'}</option>
                    <option>{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                  <input 
                    type="date" 
                    value={expiryDate} 
                    onChange={(e) => setExpiryDate(e.target.value)} 
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex gap-3 justify-end">
                <button type="submit" className="px-8 py-3 bg-[#15385E] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#17AE9F] transition-all">
                  {lang === 'ar' ? 'حفظ الشركة' : 'Save Company'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-3 bg-white border border-gray-100 text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
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
