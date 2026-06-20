import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, MapPin, Cake, Edit3, Plus, ChevronRight, Banknote, GraduationCap, Calendar, ChevronDown, Building2 } from 'lucide-react';
import { translations } from '../i18n';
import { Company } from '../types';
import { API_BASE_URL } from '../constants';

export const EmployeeDetailView = ({ onBack, lang }: { onBack: (shouldRefresh?: boolean) => void, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  const tabs = [t.general, t.job, t.payroll, t.documents, t.settings];
  const activeTab = tabs[0];

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('مطور برمجيات');
  const [department, setDepartment] = useState('التقنية');
  const [salary, setSalary] = useState('8000');
  const [address, setAddress] = useState('الرياض، السعودية');
  const [gender, setGender] = useState(lang === 'ar' ? 'ذكر' : 'Male');
  const [dob, setDob] = useState('24th July, 1998');
  const [nationality, setNationality] = useState(lang === 'ar' ? 'سعودي' : 'Saudi');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('1');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/companies`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
          if (data.length > 0) {
            setSelectedCompanyId(data[0].id.toString());
          }
        }
      } catch (e) {
        console.error("Error loading companies in employee form:", e);
      }
    };
    fetchCompanies();
  }, []);

  const handleSave = async () => {
    if (!firstName || !email) {
      alert(lang === 'ar' ? 'الاسم الأول والبريد الإلكتروني مطلوبان' : 'First Name and Email are required');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          title,
          department,
          salary: parseFloat(salary) || 0,
          status: 'نشط',
          companyId: parseInt(selectedCompanyId) || 1
        }),
      });

      if (response.ok) {
        onBack(true);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save employee');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend API');
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || (lang === 'ar' ? 'موظف جديد' : 'New Employee');

  return (
    <div className="space-y-6 animate-in slide-in-from-left-6 duration-500 pb-10">
      <div className="flex justify-between items-center">
        <button onClick={() => onBack(false)} className="flex items-center gap-2 text-gray-900 font-bold hover:text-[#15385E] transition-colors">
          <ChevronLeft size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
          <h2 className="text-xl">{lang === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee'}</h2>
        </button>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
          <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span> / <span>{t.employees}</span> / <span className="text-gray-900 font-black">{lang === 'ar' ? 'إضافة' : 'Add'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white border border-gray-50 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-50 bg-gray-50/30">
              {tabs.map((tab) => (
                <button key={tab} className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-[#15385E] bg-white' : 'text-gray-400'}`}>
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#15385E]"></div>}
                </button>
              ))}
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.first_name}</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="مثال: أحمد" className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.last_name}</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="مثال: العتيبي" className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.gender}</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm outline-none appearance-none">
                    <option>{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                    <option>{lang === 'ar' ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.dob}</label>
                  <div className="relative">
                    <input type="text" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                    <Calendar size={16} className={`absolute ${lang === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-400`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.email}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.phone}</label>
                  <div className="flex gap-2" dir="ltr">
                    <div className="w-20 px-3 py-3.5 bg-white border border-gray-100 rounded-xl text-sm flex items-center justify-between">+966 <ChevronDown size={14} /></div>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="501234567" className="flex-1 px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'الشركة' : 'Company'}</label>
                  <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm outline-none appearance-none">
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.department}</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm outline-none appearance-none">
                    <option>{lang === 'ar' ? 'التقنية' : 'Technology'}</option>
                    <option>{lang === 'ar' ? 'الموارد البشرية' : 'HR'}</option>
                    <option>{lang === 'ar' ? 'المبيعات' : 'Sales'}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.salary}</label>
                  <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.address}</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">{t.nationality}</label>
                  <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                </div>
              </div>
            </div>

            <div className="px-10 py-6 bg-gray-50/30 border-t border-gray-50 flex gap-4">
              <button onClick={handleSave} className="px-10 py-3.5 bg-[#15385E] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#15385E]/10 hover:bg-[#17AE9F] transition-all">{lang === 'ar' ? 'حفظ البيانات' : 'Save Employee'}</button>
              <button onClick={() => onBack(false)} className="px-10 py-3.5 bg-white border border-gray-100 text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">{t.cancel}</button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-gray-50 rounded-[2rem] p-8 shadow-sm relative text-center">
            <button className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} text-[#15385E] hover:bg-[#EBF2FA] p-1.5 rounded-lg transition-all`}><Edit3 size={16} /></button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-gray-50 overflow-hidden mb-4 shadow-sm">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=A7F3D0&color=065F46`} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
                <span className="px-2 py-0.5 bg-[#E8F7F5] text-[#17AE9F] text-[9px] font-bold rounded-md">{t.active}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{title}</p>
            </div>
            <div className="grid grid-cols-2 gap-y-6 pt-6 border-t border-dashed border-gray-100 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400"><Mail size={12} /><span className="text-[9px] font-bold uppercase">{t.email}</span></div>
                <p className="text-[10px] font-bold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap">{email || '—'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400"><Phone size={12} /><span className="text-[9px] font-bold uppercase">{t.phone}</span></div>
                <p className="text-[10px] font-bold text-gray-900">{phone ? `+966 ${phone}` : '—'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400"><MapPin size={12} /><span className="text-[9px] font-bold uppercase">{lang === 'ar' ? 'الموقع' : 'Location'}</span></div>
                <p className="text-[10px] font-bold text-gray-900">{address}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-400"><Cake size={12} /><span className="text-[9px] font-bold uppercase">{t.dob}</span></div>
                <p className="text-[10px] font-bold text-gray-900">{dob}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
