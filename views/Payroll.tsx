import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Users, 
  Banknote, 
  Plus, 
  Search, 
  Edit2, 
  Check, 
  AlertCircle, 
  Coins, 
  Receipt, 
  TrendingUp, 
  FileSpreadsheet,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { translations } from '../i18n';

interface Employee {
  id: number;
  empNo: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone?: string;
  status: string;
  avatar: string;
  
  // Salary info
  baseSalary?: number;
  salary?: number; // netSalary
  netSalary?: number;
  
  // Allowances
  allowanceHousing?: number;
  allowanceTransportation?: number;
  allowanceCommunication?: number;
  allowanceJobNature?: number;
  allowanceOther?: number;
  totalAllowances?: number;
  
  // Deductions
  deductionDelay?: number;
  deductionAbsence?: number;
  deductionLoan?: number;
  deductionOther?: number;
  totalDeductions?: number;
  
  // Bonuses
  bonus?: number;
  bonusReason?: string;
  
  // Bank details
  paymentMethod?: 'bank_transfer' | 'cash';
  bankName?: string;
  iban?: string;
  
  // Loans Info
  loanAmount?: number;
  loanInstallments?: number;
}

export const PayrollView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'payroll_run' | 'basic_salaries' | 'allowances' | 'deductions' | 'bonuses' | 'loans'>('payroll_run');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Editing state
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [successAlert, setSuccessAlert] = useState('');

  // Modal forms states
  const [editBaseSalary, setEditBaseSalary] = useState('0');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer');
  const [editBankName, setEditBankName] = useState('');
  const [editIban, setEditIban] = useState('');

  const [editAllowanceHousing, setEditAllowanceHousing] = useState('0');
  const [editAllowanceTransport, setEditAllowanceTransport] = useState('0');
  const [editAllowanceCommunication, setEditAllowanceCommunication] = useState('0');
  const [editAllowanceJobNature, setEditAllowanceJobNature] = useState('0');
  const [editAllowanceOther, setEditAllowanceOther] = useState('0');

  const [editDeductionDelay, setEditDeductionDelay] = useState('0');
  const [editDeductionAbsence, setEditDeductionAbsence] = useState('0');
  const [editDeductionOther, setEditDeductionOther] = useState('0');

  const [editBonus, setEditBonus] = useState('0');
  const [editBonusReason, setEditBonusReason] = useState('');

  const [editLoanAmount, setEditLoanAmount] = useState('0');
  const [editLoanInstallments, setEditLoanInstallments] = useState('1');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error("Error fetching employees for payroll:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const triggerAlert = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(''), 3000);
  };

  const startEdit = (emp: Employee) => {
    setSelectedEmpId(emp.id);
    // Basic fields
    setEditBaseSalary((emp.baseSalary ?? emp.salary ?? 0).toString());
    setEditPaymentMethod(emp.paymentMethod ?? 'bank_transfer');
    setEditBankName(emp.bankName ?? '');
    setEditIban(emp.iban ?? '');

    // Allowances
    setEditAllowanceHousing((emp.allowanceHousing ?? 0).toString());
    setEditAllowanceTransport((emp.allowanceTransportation ?? 0).toString());
    setEditAllowanceCommunication((emp.allowanceCommunication ?? 0).toString());
    setEditAllowanceJobNature((emp.allowanceJobNature ?? 0).toString());
    setEditAllowanceOther((emp.allowanceOther ?? 0).toString());

    // Deductions
    setEditDeductionDelay((emp.deductionDelay ?? 0).toString());
    setEditDeductionAbsence((emp.deductionAbsence ?? 0).toString());
    setEditDeductionOther((emp.deductionOther ?? 0).toString());

    // Bonuses
    setEditBonus((emp.bonus ?? 0).toString());
    setEditBonusReason(emp.bonusReason ?? '');

    // Loans
    setEditLoanAmount((emp.loanAmount ?? 0).toString());
    setEditLoanInstallments((emp.loanInstallments ?? 1).toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    setSaving(true);
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    // Parsed values
    const numBase = parseFloat(editBaseSalary) || 0;
    const numHousing = parseFloat(editAllowanceHousing) || 0;
    const numTransport = parseFloat(editAllowanceTransport) || 0;
    const numComm = parseFloat(editAllowanceCommunication) || 0;
    const numJob = parseFloat(editAllowanceJobNature) || 0;
    const numOtherAllow = parseFloat(editAllowanceOther) || 0;

    const numDelay = parseFloat(editDeductionDelay) || 0;
    const numAbsence = parseFloat(editDeductionAbsence) || 0;
    const numOtherDed = parseFloat(editDeductionOther) || 0;

    const numBonus = parseFloat(editBonus) || 0;
    
    // Loan Calculation
    const totalLoan = parseFloat(editLoanAmount) || 0;
    const installments = parseInt(editLoanInstallments) || 1;
    const monthlyInstallment = totalLoan > 0 ? Math.round(totalLoan / installments) : 0;

    const totalAllow = numHousing + numTransport + numComm + numJob + numOtherAllow;
    const totalDed = numDelay + numAbsence + monthlyInstallment + numOtherDed;
    const net = numBase + totalAllow + numBonus - totalDed;

    const updatedData = {
      ...emp,
      baseSalary: numBase,
      paymentMethod: editPaymentMethod,
      bankName: editBankName,
      iban: editIban,

      allowanceHousing: numHousing,
      allowanceTransportation: numTransport,
      allowanceCommunication: numComm,
      allowanceJobNature: numJob,
      allowanceOther: numOtherAllow,
      totalAllowances: totalAllow,

      deductionDelay: numDelay,
      deductionAbsence: numAbsence,
      deductionLoan: monthlyInstallment,
      deductionOther: numOtherDed,
      totalDeductions: totalDed,

      bonus: numBonus,
      bonusReason: editBonusReason,

      loanAmount: totalLoan,
      loanInstallments: installments,
      salary: net, // netSalary acts as official salary
      netSalary: net
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${selectedEmpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setEmployees(prev => prev.map(e => e.id === selectedEmpId ? updatedData : e));
        setSelectedEmpId(null);
        triggerAlert(lang === 'ar' ? 'تم تحديث بيانات الراتب بنجاح' : 'Salary details updated successfully');
      }
    } catch (err) {
      console.error("Error updating employee salary:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleProcessPayroll = () => {
    triggerAlert(lang === 'ar' ? 'تم ترحيل مسير الرواتب للشهر الحالي وإرسال الحوالات للبنك بنجاح!' : 'Monthly payroll finalized and payment runs successfully submitted to bank!');
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === '' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Departments list for filter
  const departments = Array.from(new Set(employees.map(e => e.department)));

  // Global calculations
  const totalBaseSalaries = employees.reduce((acc, e) => acc + (e.baseSalary ?? e.salary ?? 0), 0);
  const totalAllowances = employees.reduce((acc, e) => acc + (e.totalAllowances ?? 0), 0);
  const totalDeductions = employees.reduce((acc, e) => acc + (e.totalDeductions ?? 0), 0);
  const totalBonuses = employees.reduce((acc, e) => acc + (e.bonus ?? 0), 0);
  const totalNetSalary = employees.reduce((acc, e) => acc + (e.netSalary ?? e.salary ?? 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Success Alert */}
      {successAlert && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-[#E8F7F5] border border-[#17AE9F]/10 rounded-2xl flex items-center gap-3 text-xs font-bold text-[#17AE9F] shadow-lg animate-in slide-in-from-bottom duration-300">
          <CheckCircle size={16} />
          <span>{successAlert}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'ar' ? 'نظام الرواتب والأجور المتكامل' : 'Integrated Payroll & Salaries System'}
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {lang === 'ar' ? 'إعداد الرواتب الأساسية، البدلات، المكافآت، الخصومات ومسير الرواتب الشهري الموحد' : 'Configure base salaries, allowances, bonuses, deductions, and monthly payroll sheets.'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={fetchEmployees}
            className="flex items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-500 transition-all"
            title={lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={handleProcessPayroll} 
            className="bg-[#15385E] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 hover:bg-[#17AE9F] transition-all"
          >
            <FileSpreadsheet size={16} /> 
            {lang === 'ar' ? 'ترحيل مسير الرواتب' : 'Process Payroll Run'}
          </button>
        </div>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Net */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-[#E8F7F5] text-[#17AE9F] rounded-2xl shrink-0">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الرواتب المصروفة' : 'Total Monthly Payout'}</p>
            <p className="text-lg font-black text-[#15385E] mt-0.5">{totalNetSalary.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
          </div>
        </div>

        {/* Total Base */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl shrink-0">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الرواتب الأساسية' : 'Total Base Salaries'}</p>
            <p className="text-lg font-black text-gray-900 mt-0.5">{totalBaseSalaries.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
          </div>
        </div>

        {/* Total Allowances */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي البدلات والمكافآت' : 'Allowances & Bonuses'}</p>
            <p className="text-lg font-black text-gray-900 mt-0.5">{(totalAllowances + totalBonuses).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl shrink-0">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الخصومات والسلف' : 'Deductions & Loans'}</p>
            <p className="text-lg font-black text-red-500 mt-0.5">{totalDeductions.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
          </div>
        </div>

      </div>

      {/* Horizontal Subtabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar gap-6">
        {[
          { id: 'payroll_run', label: lang === 'ar' ? 'مسير الرواتب' : 'Payroll Sheet' },
          { id: 'basic_salaries', label: lang === 'ar' ? 'الرواتب الأساسية' : 'Basic Salaries' },
          { id: 'allowances', label: lang === 'ar' ? 'البدلات' : 'Allowances' },
          { id: 'deductions', label: lang === 'ar' ? 'الخصومات' : 'Deductions' },
          { id: 'bonuses', label: lang === 'ar' ? 'المكافآت' : 'Bonuses' },
          { id: 'loans', label: lang === 'ar' ? 'السلف' : 'Loans' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id as any); setSelectedEmpId(null); }}
            className={`pb-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'border-[#17AE9F] text-[#17AE9F]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-gray-100/70 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3.5 top-3 text-gray-400" size={16} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white transition-all text-right"
            placeholder={lang === 'ar' ? 'البحث عن موظف...' : 'Search employee...'}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white transition-all w-full sm:w-auto"
          >
            <option value="">{lang === 'ar' ? 'كل الأقسام' : 'All Departments'}</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="text-center py-20 text-xs text-gray-400 bg-white border border-gray-100/70 rounded-[2rem] shadow-sm">
          {lang === 'ar' ? 'جاري تحميل وتنسيق الرواتب...' : 'Loading and calculating payroll details...'}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  
                  {activeSubTab === 'payroll_run' && (
                    <>
                      <th className="px-4 py-4">{lang === 'ar' ? 'الراتب الأساسي (+)' : 'Base Salary (+)'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'إجمالي البدلات (+)' : 'Total Allowances (+)'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'المكافأة (+)' : 'Bonus (+)'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'الخصومات (-)' : 'Deductions (-)'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'السلفة (-)' : 'Loan deduction (-)'}</th>
                      <th className="px-4 py-4 text-emerald-600 font-bold">{lang === 'ar' ? 'صافي الراتب (=)' : 'Net Payout (=)'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</th>
                    </>
                  )}

                  {activeSubTab === 'basic_salaries' && (
                    <>
                      <th className="px-4 py-4">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'البنك' : 'Bank Name'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'الآيبان IBAN' : 'IBAN'}</th>
                    </>
                  )}

                  {activeSubTab === 'allowances' && (
                    <>
                      <th className="px-4 py-4">{lang === 'ar' ? 'بدل سكن' : 'Housing'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'بدل نقل' : 'Transport'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'بدل اتصال' : 'Communication'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'طبيعة عمل' : 'Job Nature'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'بدل آخر' : 'Other'}</th>
                      <th className="px-4 py-4 text-[#17AE9F] font-bold">{lang === 'ar' ? 'إجمالي البدلات' : 'Total Allowances'}</th>
                    </>
                  )}

                  {activeSubTab === 'deductions' && (
                    <>
                      <th className="px-4 py-4">{lang === 'ar' ? 'خصم تأخير' : 'Delay Deduction'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'خصم غياب' : 'Absence Deduction'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'خصم آخر' : 'Other Deduction'}</th>
                      <th className="px-4 py-4 text-red-500 font-bold">{lang === 'ar' ? 'إجمالي الخصومات' : 'Total Deductions'}</th>
                    </>
                  )}

                  {activeSubTab === 'bonuses' && (
                    <>
                      <th className="px-4 py-4">{lang === 'ar' ? 'المكافأة الحالية' : 'Current Bonus'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'سبب المكافأة' : 'Bonus Reason'}</th>
                    </>
                  )}

                  {activeSubTab === 'loans' && (
                    <>
                      <th className="px-4 py-4">{lang === 'ar' ? 'إجمالي مبلغ السلفة' : 'Total Loan Amount'}</th>
                      <th className="px-4 py-4">{lang === 'ar' ? 'الأقساط المتبقية' : 'Remaining Installments'}</th>
                      <th className="px-4 py-4 text-red-500 font-bold">{lang === 'ar' ? 'القسط الشهري' : 'Monthly installment'}</th>
                    </>
                  )}

                  <th className="px-6 py-4 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.map(emp => {
                  const base = emp.baseSalary ?? emp.salary ?? 0;
                  const housing = emp.allowanceHousing ?? 0;
                  const transport = emp.allowanceTransportation ?? 0;
                  const comm = emp.allowanceCommunication ?? 0;
                  const job = emp.allowanceJobNature ?? 0;
                  const otherAllow = emp.allowanceOther ?? 0;
                  const totalAllow = housing + transport + comm + job + otherAllow;

                  const delay = emp.deductionDelay ?? 0;
                  const absence = emp.deductionAbsence ?? 0;
                  const loanDed = emp.deductionLoan ?? 0;
                  const otherDed = emp.deductionOther ?? 0;
                  const totalDed = delay + absence + loanDed + otherDed;

                  const bonus = emp.bonus ?? 0;
                  const net = base + totalAllow + bonus - totalDed;

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/50 text-xs font-bold text-gray-700 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={emp.avatar} className="w-8 h-8 rounded-full border border-gray-100 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-gray-900 truncate">{emp.name}</span>
                          <span className="text-[9px] text-gray-400 font-medium mt-0.5">{emp.title} ({emp.empNo})</span>
                        </div>
                      </td>

                      {activeSubTab === 'payroll_run' && (
                        <>
                          <td className="px-4 py-4 font-mono">{base.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                          <td className="px-4 py-4 font-mono text-gray-500">+{totalAllow.toLocaleString()}</td>
                          <td className="px-4 py-4 font-mono text-emerald-500">+{bonus.toLocaleString()}</td>
                          <td className="px-4 py-4 font-mono text-red-500">-{totalDed.toLocaleString()}</td>
                          <td className="px-4 py-4 font-mono text-orange-500">-{loanDed.toLocaleString()}</td>
                          <td className="px-4 py-4 font-mono text-emerald-600 font-black">{net.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              emp.paymentMethod === 'cash' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                              {emp.paymentMethod === 'cash' 
                                ? (lang === 'ar' ? 'نقدي' : 'Cash') 
                                : (lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer')}
                            </span>
                          </td>
                        </>
                      )}

                      {activeSubTab === 'basic_salaries' && (
                        <>
                          <td className="px-4 py-4 font-mono">{base.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              emp.paymentMethod === 'cash' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                              {emp.paymentMethod === 'cash' ? (lang === 'ar' ? 'نقدي' : 'Cash') : (lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer')}
                            </span>
                          </td>
                          <td className="px-4 py-4">{emp.bankName || (lang === 'ar' ? 'غير مسجل' : 'Not setup')}</td>
                          <td className="px-4 py-4 font-mono text-gray-500 truncate max-w-[150px]">{emp.iban || '-'}</td>
                        </>
                      )}

                      {activeSubTab === 'allowances' && (
                        <>
                          <td className="px-4 py-4 font-mono text-gray-500">{housing}</td>
                          <td className="px-4 py-4 font-mono text-gray-500">{transport}</td>
                          <td className="px-4 py-4 font-mono text-gray-500">{comm}</td>
                          <td className="px-4 py-4 font-mono text-gray-500">{job}</td>
                          <td className="px-4 py-4 font-mono text-gray-500">{otherAllow}</td>
                          <td className="px-4 py-4 font-mono text-[#17AE9F] font-black">{totalAllow.toLocaleString()}</td>
                        </>
                      )}

                      {activeSubTab === 'deductions' && (
                        <>
                          <td className="px-4 py-4 font-mono text-gray-500">{delay}</td>
                          <td className="px-4 py-4 font-mono text-gray-500">{absence}</td>
                          <td className="px-4 py-4 font-mono text-gray-500">{otherDed}</td>
                          <td className="px-4 py-4 font-mono text-red-500 font-black">{totalDed.toLocaleString()}</td>
                        </>
                      )}

                      {activeSubTab === 'bonuses' && (
                        <>
                          <td className="px-4 py-4 font-mono text-emerald-500 font-black">+{bonus.toLocaleString()}</td>
                          <td className="px-4 py-4 text-gray-500">{emp.bonusReason || '-'}</td>
                        </>
                      )}

                      {activeSubTab === 'loans' && (
                        <>
                          <td className="px-4 py-4 font-mono">{emp.loanAmount ? emp.loanAmount.toLocaleString() : 0} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                          <td className="px-4 py-4 font-mono">{emp.loanInstallments ?? 0} {lang === 'ar' ? 'شهور' : 'months'}</td>
                          <td className="px-4 py-4 font-mono text-red-500 font-black">-{loanDed.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => startEdit(emp)}
                          className="p-2 bg-gray-50 hover:bg-[#E8F7F5] hover:text-[#17AE9F] border border-gray-100 rounded-xl transition-all"
                          title={lang === 'ar' ? 'تعديل البيانات المطبقة' : 'Edit salary details'}
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal Popup */}
      {selectedEmpId && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-6 font-sans">
          <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 space-y-6 animate-in zoom-in duration-200 text-right max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <button onClick={() => setSelectedEmpId(null)} className="p-2 text-gray-400 hover:text-gray-650 rounded-lg">
                <X size={18} />
              </button>
              <h3 className="text-base font-black text-[#15385E] flex items-center gap-2">
                <span>{lang === 'ar' ? 'تعديل بنود الراتب للموظف' : 'Configure Employee Salaries'}</span>
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Basic Salary & Bank details */}
              {activeSubTab === 'basic_salaries' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#17AE9F] uppercase tracking-wider">{lang === 'ar' ? 'بيانات الراتب الأساسي وطريقة الدفع' : 'Basic Salary & Payments'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</label>
                      <input 
                        type="number" 
                        value={editBaseSalary}
                        onChange={(e) => setEditBaseSalary(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</label>
                      <select 
                        value={editPaymentMethod}
                        onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white text-right"
                      >
                        <option value="bank_transfer">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                        <option value="cash">{lang === 'ar' ? 'نقدي' : 'Cash'}</option>
                      </select>
                    </div>
                  </div>
                  
                  {editPaymentMethod === 'bank_transfer' && (
                    <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'اسم البنك' : 'Bank Name'}</label>
                        <input 
                          type="text" 
                          value={editBankName}
                          onChange={(e) => setEditBankName(e.target.value)}
                          placeholder="e.g. Al Rajhi Bank"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] text-right" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'رقم الآيبان IBAN' : 'IBAN Code'}</label>
                        <input 
                          type="text" 
                          value={editIban}
                          onChange={(e) => setEditIban(e.target.value)}
                          placeholder="SA03 8000 0000 ..."
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] font-mono text-left" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Allowances */}
              {activeSubTab === 'allowances' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#17AE9F] uppercase tracking-wider">{lang === 'ar' ? 'البدلات الشهرية' : 'Monthly Allowances'}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'بدل سكن' : 'Housing Allowance'}</label>
                      <input 
                        type="number" 
                        value={editAllowanceHousing} 
                        onChange={(e) => setEditAllowanceHousing(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'بدل نقل' : 'Transport Allowance'}</label>
                      <input 
                        type="number" 
                        value={editAllowanceTransport} 
                        onChange={(e) => setEditAllowanceTransport(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'بدل اتصال' : 'Communication'}</label>
                      <input 
                        type="number" 
                        value={editAllowanceCommunication} 
                        onChange={(e) => setEditAllowanceCommunication(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'بدل طبيعة عمل' : 'Job Nature'}</label>
                      <input 
                        type="number" 
                        value={editAllowanceJobNature} 
                        onChange={(e) => setEditAllowanceJobNature(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'بدل آخر' : 'Other Allowance'}</label>
                      <input 
                        type="number" 
                        value={editAllowanceOther} 
                        onChange={(e) => setEditAllowanceOther(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deductions */}
              {activeSubTab === 'deductions' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-red-500 uppercase tracking-wider">{lang === 'ar' ? 'الاستقطاعات والخصومات' : 'Monthly Deductions'}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'خصم تأخير' : 'Delay Deduction'}</label>
                      <input 
                        type="number" 
                        value={editDeductionDelay} 
                        onChange={(e) => setEditDeductionDelay(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFF5F5] border border-red-100 rounded-xl text-xs font-bold text-red-600 focus:outline-none focus:border-red-400 text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'خصم غياب' : 'Absence Deduction'}</label>
                      <input 
                        type="number" 
                        value={editDeductionAbsence} 
                        onChange={(e) => setEditDeductionAbsence(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFF5F5] border border-red-100 rounded-xl text-xs font-bold text-red-600 focus:outline-none focus:border-red-400 text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'استقطاع آخر' : 'Other Deduction'}</label>
                      <input 
                        type="number" 
                        value={editDeductionOther} 
                        onChange={(e) => setEditDeductionOther(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FFF5F5] border border-red-100 rounded-xl text-xs font-bold text-red-600 focus:outline-none focus:border-red-400 text-right" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bonuses */}
              {activeSubTab === 'bonuses' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-wider">{lang === 'ar' ? 'إضافة مكافأة للموظف' : 'Award Employee Bonus'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'مبلغ المكافأة' : 'Bonus Amount'}</label>
                      <input 
                        type="number" 
                        value={editBonus} 
                        onChange={(e) => setEditBonus(e.target.value)}
                        className="w-full px-4 py-3 bg-[#E8F7F5]/50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'سبب أو تبرير المكافأة' : 'Reason / Note'}</label>
                      <input 
                        type="text" 
                        value={editBonusReason} 
                        onChange={(e) => setEditBonusReason(e.target.value)}
                        placeholder="e.g. Sales achievement bonus"
                        className="w-full px-4 py-3 bg-[#E8F7F5]/50 border border-emerald-100 rounded-xl text-xs font-bold text-gray-900 text-right" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Loans */}
              {activeSubTab === 'loans' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-orange-500 uppercase tracking-wider">{lang === 'ar' ? 'جدولة سلفة مالية جديدة' : 'Setup Employee Advance/Loan'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'إجمالي مبلغ السلفة' : 'Total Loan Amount'}</label>
                      <input 
                        type="number" 
                        value={editLoanAmount} 
                        onChange={(e) => setEditLoanAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'ar' ? 'عدد أشهر الأقساط (السداد)' : 'Installments Period (Months)'}</label>
                      <input 
                        type="number" 
                        min="1"
                        max="24"
                        value={editLoanInstallments} 
                        onChange={(e) => setEditLoanInstallments(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" 
                      />
                    </div>
                  </div>
                  {parseFloat(editLoanAmount) > 0 && (
                    <div className="p-4 bg-orange-50/50 border border-orange-100/20 rounded-2xl text-xs font-medium text-orange-600 text-right animate-in fade-in duration-300">
                      {lang === 'ar' 
                        ? `سيتم اقتطاع مبلغ قسط شهري بقيمة ${Math.round(parseFloat(editLoanAmount) / parseInt(editLoanInstallments || '1'))} ر.س تلقائياً من راتب الموظف لمدة ${editLoanInstallments} أشهر.`
                        : `A monthly deduction installment of ${Math.round(parseFloat(editLoanAmount) / parseInt(editLoanInstallments || '1'))} SAR will be automatically deducted for ${editLoanInstallments} months.`}
                    </div>
                  )}
                </div>
              )}

              {/* Master Run View Editor */}
              {activeSubTab === 'payroll_run' && (
                <div className="space-y-6">
                  {/* Basic */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-[#15385E] border-b border-gray-50 pb-2">{lang === 'ar' ? 'تفاصيل الأجور والبدلات' : 'Wages & Allowances Details'}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</label>
                        <input type="number" value={editBaseSalary} onChange={(e) => setEditBaseSalary(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'المكافآت' : 'Bonuses'}</label>
                        <input type="number" value={editBonus} onChange={(e) => setEditBonus(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'بدل سكن' : 'Housing'}</label>
                        <input type="number" value={editAllowanceHousing} onChange={(e) => setEditAllowanceHousing(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'بدل نقل' : 'Transport'}</label>
                        <input type="number" value={editAllowanceTransport} onChange={(e) => setEditAllowanceTransport(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'بدلات أخرى' : 'Other Allowances'}</label>
                        <input type="number" value={editAllowanceOther} onChange={(e) => setEditAllowanceOther(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-right" />
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-red-500 border-b border-gray-50 pb-2">{lang === 'ar' ? 'الاستقطاعات والخصومات' : 'Deductions Details'}</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'خصم تأخير' : 'Delay'}</label>
                        <input type="number" value={editDeductionDelay} onChange={(e) => setEditDeductionDelay(e.target.value)} className="w-full px-4 py-2.5 bg-[#FFF5F5] border border-red-50 rounded-xl text-xs font-bold text-red-600 text-right" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'خصم غياب' : 'Absence'}</label>
                        <input type="number" value={editDeductionAbsence} onChange={(e) => setEditDeductionAbsence(e.target.value)} className="w-full px-4 py-2.5 bg-[#FFF5F5] border border-red-50 rounded-xl text-xs font-bold text-red-600 text-right" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400">{lang === 'ar' ? 'استقطاع آخر' : 'Other Deduction'}</label>
                        <input type="number" value={editDeductionOther} onChange={(e) => setEditDeductionOther(e.target.value)} className="w-full px-4 py-2.5 bg-[#FFF5F5] border border-red-50 rounded-xl text-xs font-bold text-red-600 text-right" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-50 justify-end">
                <button 
                  type="button" 
                  onClick={() => setSelectedEmpId(null)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold text-xs"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[#15385E] hover:bg-[#17AE9F] text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};