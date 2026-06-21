import React, { useState, useEffect } from 'react';
import { ChevronLeft, Mail, Phone, MapPin, Cake, Edit3, Plus, ChevronRight, Banknote, GraduationCap, Calendar, ChevronDown, Building2, ShieldCheck, Clock, FileText, Settings } from 'lucide-react';
import { translations } from '../i18n';
import { Company } from '../types';
import { API_BASE_URL } from '../constants';

export const EmployeeDetailView = ({ employee, onBack, lang }: { employee?: any, onBack: (shouldRefresh?: boolean) => void, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  const tabs = [t.general, t.job, t.payroll, t.documents, t.settings];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // Form states (General Tab)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('الرياض، السعودية');
  const [gender, setGender] = useState(lang === 'ar' ? 'ذكر' : 'Male');
  const [dob, setDob] = useState('24th July, 1998');
  const [nationality, setNationality] = useState(lang === 'ar' ? 'سعودي' : 'Saudi');

  // Form states (Job Tab)
  const [empNo, setEmpNo] = useState('');
  const [title, setTitle] = useState('مطور برمجيات');
  const [department, setDepartment] = useState('التقنية');
  const [administration, setAdministration] = useState('الإدارة العامة');
  const [branch, setBranch] = useState('الفرع الرئيسي');
  const [lineManager, setLineManager] = useState('');
  const [contractType, setContractType] = useState(lang === 'ar' ? 'دوام كامل' : 'Full-time');
  const [hiringDate, setHiringDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractStartDate, setContractStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractEndDate, setContractEndDate] = useState('');
  const [workStartDate, setWorkStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeStatus, setEmployeeStatus] = useState(lang === 'ar' ? 'على رأس العمل' : 'Active');
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [dailyWorkingHours, setDailyWorkingHours] = useState('8');
  const [weeklyWorkDays, setWeeklyWorkDays] = useState('5');
  const [hasSocialInsurance, setHasSocialInsurance] = useState(false);
  const [socialInsuranceNumber, setSocialInsuranceNumber] = useState('');

  // Form states (Payroll Tab)
  const [baseSalary, setBaseSalary] = useState('0');
  const [allowanceHousing, setAllowanceHousing] = useState('0');
  const [allowanceTransportation, setAllowanceTransportation] = useState('0');
  const [allowanceCommunication, setAllowanceCommunication] = useState('0');
  const [allowanceJobNature, setAllowanceJobNature] = useState('0');
  const [allowanceOther, setAllowanceOther] = useState('0');
  const [deductionDelay, setDeductionDelay] = useState('0');
  const [deductionAbsence, setDeductionAbsence] = useState('0');
  const [deductionLoan, setDeductionLoan] = useState('0');
  const [deductionOther, setDeductionOther] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState(lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer');
  const [bankName, setBankName] = useState('');
  const [bankIban, setBankIban] = useState('');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('1');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/companies`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
          if (data.length > 0 && !employee) {
            setSelectedCompanyId(data[0].id.toString());
          }
        }
      } catch (e) {
        console.error("Error loading companies in employee form:", e);
      }
    };
    fetchCompanies();
  }, [employee]);

  // Load existing employee data if editing
  useEffect(() => {
    if (employee) {
      const nameParts = (employee.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setTitle(employee.title || 'مطور برمجيات');
      setDepartment(employee.department || 'التقنية');
      setAddress(employee.address || 'الرياض، السعودية');
      setGender(employee.gender || (lang === 'ar' ? 'ذكر' : 'Male'));
      setDob(employee.dob || '24th July, 1998');
      setNationality(employee.nationality || (lang === 'ar' ? 'سعودي' : 'Saudi'));
      
      if (employee.companyId) {
        setSelectedCompanyId(employee.companyId.toString());
      }

      // Populate custom job fields
      setEmpNo(employee.empNo || '');
      setAdministration(employee.administration || 'الإدارة العامة');
      setBranch(employee.branch || 'الفرع الرئيسي');
      setLineManager(employee.lineManager || '');
      setContractType(employee.contractType || (lang === 'ar' ? 'دوام كامل' : 'Full-time'));
      setHiringDate(employee.hiringDate || new Date().toISOString().split('T')[0]);
      setContractStartDate(employee.contractStartDate || new Date().toISOString().split('T')[0]);
      setContractEndDate(employee.contractEndDate || '');
      setWorkStartDate(employee.workStartDate || new Date().toISOString().split('T')[0]);
      setEmployeeStatus(employee.status || (lang === 'ar' ? 'على رأس العمل' : 'Active'));
      setWorkingHoursStart(employee.workingHoursStart || '08:00');
      setWorkingHoursEnd(employee.workingHoursEnd || '17:00');
      setDailyWorkingHours(employee.dailyWorkingHours || '8');
      setWeeklyWorkDays(employee.weeklyWorkDays || '5');
      setHasSocialInsurance(employee.hasSocialInsurance === true);
      setSocialInsuranceNumber(employee.socialInsuranceNumber || '');

      // Populate custom payroll fields
      setBaseSalary(employee.baseSalary ? employee.baseSalary.toString() : (employee.salary ? employee.salary.toString() : '0'));
      setAllowanceHousing(employee.allowanceHousing ? employee.allowanceHousing.toString() : '0');
      setAllowanceTransportation(employee.allowanceTransportation ? employee.allowanceTransportation.toString() : '0');
      setAllowanceCommunication(employee.allowanceCommunication ? employee.allowanceCommunication.toString() : '0');
      setAllowanceJobNature(employee.allowanceJobNature ? employee.allowanceJobNature.toString() : '0');
      setAllowanceOther(employee.allowanceOther ? employee.allowanceOther.toString() : '0');
      setDeductionDelay(employee.deductionDelay ? employee.deductionDelay.toString() : '0');
      setDeductionAbsence(employee.deductionAbsence ? employee.deductionAbsence.toString() : '0');
      setDeductionLoan(employee.deductionLoan ? employee.deductionLoan.toString() : '0');
      setDeductionOther(employee.deductionOther ? employee.deductionOther.toString() : '0');
      setPaymentMethod(employee.paymentMethod || (lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'));
      setBankName(employee.bankName || '');
      setBankIban(employee.bankIban || '');
    }
  }, [employee, lang]);

  // Real-time salary calculations
  const numBaseSalary = parseFloat(baseSalary) || 0;
  const numAllowanceHousing = parseFloat(allowanceHousing) || 0;
  const numAllowanceTransportation = parseFloat(allowanceTransportation) || 0;
  const numAllowanceCommunication = parseFloat(allowanceCommunication) || 0;
  const numAllowanceJobNature = parseFloat(allowanceJobNature) || 0;
  const numAllowanceOther = parseFloat(allowanceOther) || 0;
  
  const numDeductionDelay = parseFloat(deductionDelay) || 0;
  const numDeductionAbsence = parseFloat(deductionAbsence) || 0;
  const numDeductionLoan = parseFloat(deductionLoan) || 0;
  const numDeductionOther = parseFloat(deductionOther) || 0;

  const totalAllowances = numAllowanceHousing + numAllowanceTransportation + numAllowanceCommunication + numAllowanceJobNature + numAllowanceOther;
  const totalDeductions = numDeductionDelay + numDeductionAbsence + numDeductionLoan + numDeductionOther;
  const netSalary = numBaseSalary + totalAllowances - totalDeductions;

  const handleSave = async () => {
    if (!firstName || !email) {
      alert(lang === 'ar' ? 'الاسم الأول والبريد الإلكتروني مطلوبان' : 'First Name and Email are required');
      return;
    }
    try {
      const body = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        title,
        department,
        salary: netSalary, // netSalary acts as official salary
        status: employeeStatus,
        companyId: parseInt(selectedCompanyId) || 1,
        address,
        gender,
        dob,
        nationality,
        empNo,
        administration,
        branch,
        lineManager,
        contractType,
        hiringDate,
        contractStartDate,
        contractEndDate,
        workStartDate,
        workingHoursStart,
        workingHoursEnd,
        dailyWorkingHours,
        weeklyWorkDays,
        hasSocialInsurance,
        socialInsuranceNumber,
        // Payroll details
        baseSalary: numBaseSalary,
        allowanceHousing: numAllowanceHousing,
        allowanceTransportation: numAllowanceTransportation,
        allowanceCommunication: numAllowanceCommunication,
        allowanceJobNature: numAllowanceJobNature,
        allowanceOther: numAllowanceOther,
        deductionDelay: numDeductionDelay,
        deductionAbsence: numDeductionAbsence,
        deductionLoan: numDeductionLoan,
        deductionOther: numDeductionOther,
        paymentMethod,
        bankName,
        bankIban,
        totalAllowances,
        totalDeductions,
        netSalary
      };

      const url = employee 
        ? `${API_BASE_URL}/api/employees/${employee.id}`
        : `${API_BASE_URL}/api/employees`;
      const method = employee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
          <h2 className="text-xl">
            {employee 
              ? (lang === 'ar' ? 'تعديل بيانات الموظف' : 'Edit Employee Details')
              : (lang === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee')}
          </h2>
        </button>
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
          <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span> / <span>{t.employees}</span> / <span className="text-gray-900 font-black">{employee ? (lang === 'ar' ? 'تعديل' : 'Edit') : (lang === 'ar' ? 'إضافة' : 'Add')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white border border-gray-50 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-50 bg-gray-50/30 overflow-x-auto">
              {tabs.map((tab) => (
                <button 
                  key={tab} 
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-[#15385E] bg-white' : 'text-gray-400'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#15385E]"></div>}
                </button>
              ))}
            </div>

            <div className="p-10 space-y-8">
              {/* GENERAL TAB */}
              {activeTab === t.general && (
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
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{t.address}</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{t.nationality}</label>
                    <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                </div>
              )}

              {/* JOB TAB */}
              {activeTab === t.job && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 1. بيانات التوظيف */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2">
                    <Building2 size={14} /> {lang === 'ar' ? 'بيانات التوظيف' : 'Employment Details'}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'الرقم الوظيفي (Employee ID)' : 'Employee ID'}</label>
                    <input type="text" value={empNo} onChange={(e) => setEmpNo(e.target.value)} placeholder="EMP-XXXX" className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
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
                      <option>{lang === 'ar' ? 'التسويق' : 'Marketing'}</option>
                      <option>{lang === 'ar' ? 'المالية' : 'Finance'}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'الإدارة' : 'Administration/Management'}</label>
                    <input type="text" value={administration} onChange={(e) => setAdministration(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'الفرع' : 'Branch'}</label>
                    <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'المدير المباشر' : 'Line Manager'}</label>
                    <input type="text" value={lineManager} onChange={(e) => setLineManager(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>

                  {/* 2. نوع العقد */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <FileText size={14} /> {lang === 'ar' ? 'نوع العقد' : 'Contract Type'}
                  </h3>
                  <div className="space-y-2 col-span-full">
                    <div className="flex flex-wrap gap-4">
                      {[(lang === 'ar' ? 'دوام كامل' : 'Full-time'), 
                        (lang === 'ar' ? 'دوام جزئي' : 'Part-time'), 
                        (lang === 'ar' ? 'عقد مؤقت' : 'Temporary'), 
                        (lang === 'ar' ? 'متدرب' : 'Intern')].map((type) => (
                        <label key={type} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${contractType === type ? 'border-[#17AE9F] bg-[#E8F7F5] text-[#15385E]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                          <input type="radio" name="contractType" value={type} checked={contractType === type} onChange={(e) => setContractType(e.target.value)} className="hidden" />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3. تواريخ العمل */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <Calendar size={14} /> {lang === 'ar' ? 'تواريخ العمل' : 'Employment Dates'}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'تاريخ التوظيف' : 'Hiring Date'}</label>
                    <input type="date" value={hiringDate} onChange={(e) => setHiringDate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'تاريخ بداية العقد' : 'Contract Start Date'}</label>
                    <input type="date" value={contractStartDate} onChange={(e) => setContractStartDate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'تاريخ نهاية العقد (إن وجد)' : 'Contract End Date'}</label>
                    <input type="date" value={contractEndDate} onChange={(e) => setContractEndDate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'تاريخ مباشرة العمل' : 'Work Start Date'}</label>
                    <input type="date" value={workStartDate} onChange={(e) => setWorkStartDate(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>

                  {/* 4. حالة الموظف */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <ShieldCheck size={14} /> {lang === 'ar' ? 'حالة الموظف' : 'Employee Status'}
                  </h3>
                  <div className="space-y-2 col-span-full">
                    <div className="flex flex-wrap gap-4">
                      {[(lang === 'ar' ? 'على رأس العمل' : 'On duty'), 
                        (lang === 'ar' ? 'إجازة' : 'On Leave'), 
                        (lang === 'ar' ? 'موقوف' : 'Suspended'), 
                        (lang === 'ar' ? 'مستقيل' : 'Resigned'), 
                        (lang === 'ar' ? 'منتهي الخدمة' : 'Terminated')].map((statusOpt) => (
                        <label key={statusOpt} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${employeeStatus === statusOpt ? 'border-[#15385E] bg-gray-50 text-[#15385E]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                          <input type="radio" name="employeeStatus" value={statusOpt} checked={employeeStatus === statusOpt} onChange={(e) => setEmployeeStatus(e.target.value)} className="hidden" />
                          {statusOpt}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 5. أوقات الدوام */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <Clock size={14} /> {lang === 'ar' ? 'أوقات الدوام' : 'Work Hours'}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'وقت الدخول' : 'Clock-In Time'}</label>
                    <input type="time" value={workingHoursStart} onChange={(e) => setWorkingHoursStart(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'وقت الخروج' : 'Clock-Out Time'}</label>
                    <input type="time" value={workingHoursEnd} onChange={(e) => setWorkingHoursEnd(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'ساعات العمل اليومية' : 'Daily Working Hours'}</label>
                    <input type="number" value={dailyWorkingHours} onChange={(e) => setDailyWorkingHours(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'أيام العمل الأسبوعية' : 'Weekly Work Days'}</label>
                    <input type="number" value={weeklyWorkDays} onChange={(e) => setWeeklyWorkDays(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>

                  {/* 6. التأمينات */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <ShieldCheck size={14} /> {lang === 'ar' ? 'التأمينات الاجتماعية' : 'Social Insurance'}
                  </h3>
                  <div className="space-y-2 col-span-full flex items-center gap-3">
                    <input type="checkbox" id="hasSocialInsurance" checked={hasSocialInsurance} onChange={(e) => setHasSocialInsurance(e.target.checked)} className="w-5 h-5 accent-[#17AE9F] rounded-lg border-gray-200" />
                    <label htmlFor="hasSocialInsurance" className="text-xs font-bold text-gray-700 cursor-pointer">{lang === 'ar' ? 'مشترك بالتأمينات الاجتماعية' : 'Enrolled in Social Insurance'}</label>
                  </div>
                  {hasSocialInsurance && (
                    <div className="space-y-2 col-span-full max-w-md animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'رقم الاشتراك بالتأمينات' : 'Social Insurance Number'}</label>
                      <input type="text" value={socialInsuranceNumber} onChange={(e) => setSocialInsuranceNumber(e.target.value)} placeholder="XXXXXXXX" className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                    </div>
                  )}
                </div>
              )}

              {/* PAYROLL TAB */}
              {activeTab === t.payroll && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 1. الراتب الأساسي */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2">
                    <Banknote size={14} /> {lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</label>
                    <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>

                  {/* 2. البدلات */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <Plus size={14} className="text-[#17AE9F]" /> {lang === 'ar' ? 'البدلات' : 'Allowances'}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'بدل سكن' : 'Housing Allowance'}</label>
                    <input type="number" value={allowanceHousing} onChange={(e) => setAllowanceHousing(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'بدل نقل' : 'Transportation Allowance'}</label>
                    <input type="number" value={allowanceTransportation} onChange={(e) => setAllowanceTransportation(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'بدل اتصال' : 'Communication Allowance'}</label>
                    <input type="number" value={allowanceCommunication} onChange={(e) => setAllowanceCommunication(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'بدل طبيعة عمل' : 'Job Nature Allowance'}</label>
                    <input type="number" value={allowanceJobNature} onChange={(e) => setAllowanceJobNature(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'بدل آخر' : 'Other Allowance'}</label>
                    <input type="number" value={allowanceOther} onChange={(e) => setAllowanceOther(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>

                  {/* 3. الاستقطاعات */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <ChevronRight size={14} className="text-red-500 rotate-90" /> {lang === 'ar' ? 'الاستقطاعات والخصومات' : 'Deductions'}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'خصم تأخير' : 'Delay Deduction'}</label>
                    <input type="number" value={deductionDelay} onChange={(e) => setDeductionDelay(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'خصم غياب' : 'Absence Deduction'}</label>
                    <input type="number" value={deductionAbsence} onChange={(e) => setDeductionAbsence(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'سلفة' : 'Loan/Advance'}</label>
                    <input type="number" value={deductionLoan} onChange={(e) => setDeductionLoan(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'استقطاع آخر' : 'Other Deduction'}</label>
                    <input type="number" value={deductionOther} onChange={(e) => setDeductionOther(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                  </div>

                  {/* 4. معلومات الراتب وطريقة الدفع */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <GraduationCap size={14} /> {lang === 'ar' ? 'معلومات الدفع والحساب البنكي' : 'Payment Details'}
                  </h3>
                  <div className="space-y-2 col-span-full">
                    <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</label>
                    <div className="flex gap-4">
                      {[(lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'), 
                        (lang === 'ar' ? 'نقدي' : 'Cash')].map((method) => (
                        <label key={method} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${paymentMethod === method ? 'border-[#17AE9F] bg-[#E8F7F5] text-[#15385E]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}>
                          <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === (lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer') && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'اسم البنك' : 'Bank Name'}</label>
                        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="مثال: مصرف الراجحي" className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none" />
                      </div>
                      <div className="space-y-2 lg:col-span-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'رقم الآيبان IBAN' : 'IBAN Number'}</label>
                        <input type="text" value={bankIban} onChange={(e) => setBankIban(e.target.value)} placeholder="SAXXXXXXXXXXXXXXXXXXXXXXXX" className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 ring-[#15385E]/10 outline-none text-left" dir="ltr" />
                      </div>
                    </>
                  )}

                  {/* 5. احتساب الراتب */}
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 col-span-full flex items-center gap-2 mt-4">
                    <Banknote size={14} className="text-[#17AE9F]" /> {lang === 'ar' ? 'احتساب الراتب الإجمالي والصافي' : 'Salary Calculations'}
                  </h3>
                  <div className="space-y-2 bg-[#E8F7F5]/50 p-4 rounded-2xl border border-[#17AE9F]/10">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'إجمالي البدلات (+)' : 'Total Allowances'}</label>
                    <p className="text-lg font-black text-[#15385E] mt-1">{totalAllowances.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
                  </div>
                  <div className="space-y-2 bg-red-50/50 p-4 rounded-2xl border border-red-200/10">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{lang === 'ar' ? 'إجمالي الاستقطاعات (-)' : 'Total Deductions'}</label>
                    <p className="text-lg font-black text-red-500 mt-1">{totalDeductions.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
                  </div>
                  <div className="space-y-2 bg-[#15385E] p-4 rounded-2xl border border-[#15385E]/10 text-white md:col-span-1 lg:col-span-1">
                    <label className="text-[10px] font-bold text-white/70 uppercase">{lang === 'ar' ? 'صافي الراتب (=)' : 'Net Salary'}</label>
                    <p className="text-lg font-black text-white mt-1">{netSalary.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
                  </div>
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === t.documents && (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 space-y-4">
                  <FileText size={48} className="mx-auto text-gray-300" />
                  <p className="text-sm font-bold">{lang === 'ar' ? 'لا توجد مستندات مرفوعة بعد' : 'No documents uploaded yet'}</p>
                  <button type="button" className="px-6 py-2 bg-gray-50 hover:bg-gray-100 text-[#15385E] rounded-xl text-xs font-bold border border-gray-100 transition-all">
                    {lang === 'ar' ? 'إضافة مستند جديد' : 'Upload New Document'}
                  </button>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === t.settings && (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-[#15385E] uppercase border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Settings size={14} /> {lang === 'ar' ? 'إعدادات الحساب والصلاحيات' : 'Account & Access Settings'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="isApiUser" defaultChecked className="w-5 h-5 accent-[#15385E]" />
                    <label htmlFor="isApiUser" className="text-xs font-bold text-gray-700">{lang === 'ar' ? 'تمكين الوصول إلى تطبيق الخدمة الذاتية للهاتف' : 'Enable Mobile Self-Service Access'}</label>
                  </div>
                </div>
              )}
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
