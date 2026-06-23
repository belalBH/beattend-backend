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
  X,
  Star,
  Clock,
  Wallet,
  FileText,
  MoreHorizontal,
  Download,
  Eye,
  Settings,
  Briefcase,
  Calendar,
  ChevronRight,
  ChevronLeft,
  UserCheck
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
  const [activeSubTab, setActiveSubTab] = useState<
    'payroll_run' | 'basic_salaries' | 'contracts' | 'structures' | 'rules' | 'loans' | 'bonuses' | 'reports' | 'settings'
  >('payroll_run');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Editing state for employees
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

  // Custom event listener for right-side sidebar actions
  useEffect(() => {
    const handleSidebarAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const action = customEvent.detail;
      if (action === 'calculate') {
        handleRecalculate();
      } else if (action === 'create') {
        handleCreateNewRun();
      } else if (action === 'export-bank') {
        handleExportData();
      } else if (action === 'import-attendance') {
        triggerAlert(lang === 'ar' ? 'تم استيراد بيانات بصمة الموظفين وساعات التأخير بنجاح!' : 'Attendance & lateness data imported successfully!');
      } else if (action === 'settings') {
        setActiveSubTab('settings');
      } else if (action === 'report') {
        setActiveSubTab('reports');
      }
    };

    window.addEventListener('payroll-action', handleSidebarAction);
    return () => {
      window.removeEventListener('payroll-action', handleSidebarAction);
    };
  }, [lang]);

  // Mock Payroll Runs from Mockup Screenshot
  const [payrollRuns, setPayrollRuns] = useState([
    { id: 1, name: 'مسير يوليو 2025', nameEn: 'July 2025 Payroll', period: '01/07/2025 - 31/07/2025', employees: 120, total: 45000, status: 'completed', createdDate: '23/07/2025', approvedDate: '23/07/2025' },
    { id: 2, name: 'مسير يونيو 2025', nameEn: 'June 2025 Payroll', period: '01/06/2025 - 30/06/2025', employees: 118, total: 42800, status: 'approved', createdDate: '25/06/2025', approvedDate: '25/06/2025' },
    { id: 3, name: 'مسير مايو 2025', nameEn: 'May 2025 Payroll', period: '01/05/2025 - 31/05/2025', employees: 116, total: 41200, status: 'approved', createdDate: '27/05/2025', approvedDate: '27/05/2025' },
    { id: 4, name: 'مسير أبريل 2025', nameEn: 'April 2025 Payroll', period: '01/04/2025 - 30/04/2025', employees: 115, total: 40100, status: 'approved', createdDate: '25/04/2025', approvedDate: '25/04/2025' },
    { id: 5, name: 'مسير مارس 2025', nameEn: 'March 2025 Payroll', period: '01/03/2025 - 31/03/2025', employees: 113, total: 39000, status: 'approved', createdDate: '25/03/2025', approvedDate: '25/03/2025' },
    { id: 6, name: 'مسير فبراير 2025', nameEn: 'February 2025 Payroll', period: '01/02/2025 - 28/02/2025', employees: 110, total: 38000, status: 'approved', createdDate: '25/02/2025', approvedDate: '25/02/2025' },
    { id: 7, name: 'مسير يناير 2025', nameEn: 'January 2025 Payroll', period: '01/01/2025 - 31/01/2025', employees: 108, total: 37500, status: 'approved', createdDate: '26/01/2025', approvedDate: '26/01/2025' }
  ]);

  // Mock Contracts
  const contracts = [
    { id: 1, empName: 'أحمد العتيبي', type: 'دوام كامل', typeEn: 'Full-time', start: '01/01/2024', end: '31/12/2025', basic: 12000, allow: 3000, status: 'active' },
    { id: 2, empName: 'سارة الغامدي', type: 'دوام كامل', typeEn: 'Full-time', start: '15/03/2023', end: '14/03/2026', basic: 10500, allow: 2500, status: 'active' },
    { id: 3, empName: 'خالد الدوسري', type: 'دوام جزئي', typeEn: 'Part-time', start: '01/08/2024', end: '31/07/2025', basic: 6000, allow: 1000, status: 'active' },
    { id: 4, empName: 'ريم القحطاني', type: 'عقد محدد', typeEn: 'Fixed Contract', start: '10/10/2024', end: '09/10/2025', basic: 8500, allow: 1500, status: 'active' }
  ];

  // Mock Structures
  const structures = [
    { id: 1, name: 'هيكل الإدارة العامة', nameEn: 'HQ Administration Structure', basicRange: '8,000 - 25,000 ر.س', housing: '25%', transport: '10%', insurance: 'عائلي مميز', gosi: '9% سوري/سعودي' },
    { id: 2, name: 'هيكل المبيعات والتسويق', nameEn: 'Sales & Marketing Structure', basicRange: '5,000 - 15,000 ر.س', housing: '25%', transport: '15%', insurance: 'أفراد مميز', gosi: '9%' },
    { id: 3, name: 'هيكل الدعم التقني والبرمجة', nameEn: 'Technical Support & Development', basicRange: '10,000 - 30,000 ر.س', housing: '25%', transport: '10%', insurance: 'عائلي مميز', gosi: '9%' }
  ];

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
    setEditBaseSalary((emp.baseSalary ?? emp.salary ?? 0).toString());
    setEditPaymentMethod(emp.paymentMethod ?? 'bank_transfer');
    setEditBankName(emp.bankName ?? '');
    setEditIban(emp.iban ?? '');

    setEditAllowanceHousing((emp.allowanceHousing ?? 0).toString());
    setEditAllowanceTransport((emp.allowanceTransportation ?? 0).toString());
    setEditAllowanceCommunication((emp.allowanceCommunication ?? 0).toString());
    setEditAllowanceJobNature((emp.allowanceJobNature ?? 0).toString());
    setEditAllowanceOther((emp.allowanceOther ?? 0).toString());

    setEditDeductionDelay((emp.deductionDelay ?? 0).toString());
    setEditDeductionAbsence((emp.deductionAbsence ?? 0).toString());
    setEditDeductionOther((emp.deductionOther ?? 0).toString());

    setEditBonus((emp.bonus ?? 0).toString());
    setEditBonusReason(emp.bonusReason ?? '');

    setEditLoanAmount((emp.loanAmount ?? 0).toString());
    setEditLoanInstallments((emp.loanInstallments ?? 1).toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    setSaving(true);
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

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
      salary: net,
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

  const handleApprovePayroll = () => {
    setPayrollRuns(prev => prev.map(r => r.id === 1 ? { ...r, status: 'approved' } : r));
    triggerAlert(lang === 'ar' ? 'تم اعتماد مسير الرواتب لشهر يوليو 2025 بنجاح!' : 'July 2025 Payroll Run approved successfully!');
  };

  const handleCancelApproval = () => {
    setPayrollRuns(prev => prev.map(r => r.id === 1 ? { ...r, status: 'draft' } : r));
    triggerAlert(lang === 'ar' ? 'تم إلغاء اعتماد مسير الرواتب وإعادته كمسودة' : 'Payroll Run approval cancelled and set back to draft');
  };

  const handleRecalculate = () => {
    triggerAlert(lang === 'ar' ? 'جاري إعادة احتساب بنود الرواتب بناء على إعدادات الموظفين الحالية...' : 'Recalculating salary structures for current active employees...');
  };

  const handleCreateNewRun = () => {
    const nextId = payrollRuns.length + 1;
    const newRun = {
      id: nextId,
      name: lang === 'ar' ? 'مسير أغسطس 2025' : 'August 2025 Payroll',
      nameEn: 'August 2025 Payroll',
      period: '01/08/2025 - 31/08/2025',
      employees: 120,
      total: 45200,
      status: 'approved',
      createdDate: '24/08/2025',
      approvedDate: '24/08/2025'
    };
    setPayrollRuns([newRun, ...payrollRuns]);
    triggerAlert(lang === 'ar' ? 'تم إنشاء مسير رواتب جديد لشهر أغسطس 2025 بنجاح' : 'New August 2025 Payroll Run created successfully');
  };

  const handleExportData = () => {
    triggerAlert(lang === 'ar' ? 'جاري تصدير مسير الرواتب بصيغة إكسل...' : 'Exporting payroll sheet to Excel format...');
  };

  // Filtered employees for employee sub-tabs
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === '' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(employees.map(e => e.department)));

  // Global calculations
  const totalBaseSalaries = employees.reduce((acc, e) => acc + (e.baseSalary ?? e.salary ?? 0), 0);
  const totalAllowances = employees.reduce((acc, e) => acc + (e.totalAllowances ?? 0), 0);
  const totalDeductions = employees.reduce((acc, e) => acc + (e.totalDeductions ?? 0), 0);
  const totalBonuses = employees.reduce((acc, e) => acc + (e.bonus ?? 0), 0);
  const totalNetSalary = employees.reduce((acc, e) => acc + (e.netSalary ?? e.salary ?? 0), 0);

  // Fallbacks to mock metrics matching the screenshot
  const displayEmpCount = employees.length > 0 ? employees.length : 120;
  const displayBase = totalBaseSalaries > 0 ? totalBaseSalaries : 45000;
  const displayNet = totalNetSalary > 0 ? totalNetSalary : 42000;
  const displayAllow = totalAllowances > 0 ? totalAllowances : 6500;
  const displayDeductions = totalDeductions > 0 ? totalDeductions : 3500;
  const displayBonuses = totalBonuses > 0 ? totalBonuses : 4200;

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
      <div className="bg-transparent p-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white">
            {lang === 'ar' ? 'مسير الرواتب' : 'Payroll Run'}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {lang === 'ar' ? 'إنشاء وإدارة مسيرات الرواتب للموظفين' : 'Create and manage payroll runs for employees.'}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={fetchEmployees}
            className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all shadow-md"
            title={lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Horizontal Sub-tabs Navigation */}
      <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar gap-6 mb-6">
        {[
          { id: 'payroll_run', label: lang === 'ar' ? 'حالات الرواتب' : 'Payroll Status' },
          { id: 'basic_salaries', label: lang === 'ar' ? 'الموظفين' : 'Employees' },
          { id: 'contracts', label: lang === 'ar' ? 'العقود' : 'Contracts' },
          { id: 'structures', label: lang === 'ar' ? 'هياكل الرواتب' : 'Salary Structures' },
          { id: 'rules', label: lang === 'ar' ? 'قواعد الرواتب' : 'Payroll Rules' },
          { id: 'loans', label: lang === 'ar' ? 'السلف' : 'Loans' },
          { id: 'bonuses', label: lang === 'ar' ? 'المكافآت' : 'Bonuses' },
          { id: 'reports', label: lang === 'ar' ? 'التقارير' : 'Reports' },
          { id: 'settings', label: lang === 'ar' ? 'الإعدادات' : 'Settings' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id as any); setSelectedEmpId(null); }}
            className={`pb-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'border-[#06B6D4] text-[#06B6D4] drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of 6 Metrics Cards matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 6: Bonuses (Star, Blue Theme) */}
        <div className="glass-card p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#06B6D4] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Star size={18} />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+10%</span>
          </div>
          <div className={`mt-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'المكافآت' : 'Bonuses'}</p>
            <p className="text-lg font-black text-white mt-1">{displayBonuses.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
            <p className="text-[9px] text-slate-500 mt-1">{lang === 'ar' ? 'من الشهر الماضي' : 'from last month'}</p>
          </div>
        </div>

        {/* Card 5: Deductions (Receipt, Red Theme) */}
        <div className="glass-card p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
              <Receipt size={18} />
            </div>
            <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">-5%</span>
          </div>
          <div className={`mt-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'الخصومات' : 'Deductions'}</p>
            <p className="text-lg font-black text-white mt-1">{displayDeductions.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
            <p className="text-[9px] text-slate-500 mt-1">{lang === 'ar' ? 'من الشهر الماضي' : 'from last month'}</p>
          </div>
        </div>

        {/* Card 4: Disbursed This Month (Check/Wallet, Green Theme) */}
        <div className="glass-card p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <Wallet size={18} />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">93%</span>
          </div>
          <div className={`mt-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'تم الصرف هذا الشهر' : 'Disbursed This Month'}</p>
            <p className="text-lg font-black text-white mt-1">{displayNet.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
            <p className="text-[9px] text-slate-500 mt-1">{lang === 'ar' ? 'من الإجمالي' : 'of total'}</p>
          </div>
        </div>

        {/* Card 3: Pending Approval (Clock, Orange Theme) */}
        <div className="glass-card p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
              <Clock size={18} />
            </div>
            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{lang === 'ar' ? '2 للمراجعة' : '2 pending'}</span>
          </div>
          <div className={`mt-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'الرواتب قيد الاعتماد' : 'Pending Approval'}</p>
            <p className="text-lg font-black text-white mt-1">{lang === 'ar' ? '8 مسيرات' : '8 runs'}</p>
            <p className="text-[9px] text-slate-500 mt-1">{lang === 'ar' ? 'في انتظار المراجعة' : 'awaiting approval'}</p>
          </div>
        </div>

        {/* Card 2: Employee Count (Users, Cyan Theme) */}
        <div className="glass-card p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <Users size={18} />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+8%</span>
          </div>
          <div className={`mt-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'عدد الموظفين' : 'Employees Count'}</p>
            <p className="text-lg font-black text-white mt-1">{displayEmpCount} {lang === 'ar' ? 'موظف' : 'employees'}</p>
            <p className="text-[9px] text-slate-500 mt-1">{lang === 'ar' ? 'موظف نشط بالمسير' : 'active in run'}</p>
          </div>
        </div>

        {/* Card 1: Total Base Salaries (Banknote, Violet/Indigo Theme) */}
        <div className="glass-card p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.15)]">
              <Banknote size={18} />
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <div className={`mt-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الرواتب الأساسية' : 'Total Base Salaries'}</p>
            <p className="text-lg font-black text-white mt-1">{displayBase.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
            <p className="text-[9px] text-slate-500 mt-1">{lang === 'ar' ? 'من الشهر الماضي' : 'from last month'}</p>
          </div>
        </div>

      </div>

      {/* Action Bar / Filter Row */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-5 border border-white/5 shadow-sm">
        
        {/* Actions Left (RTL layout: floats left) */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-start">
          <button 
            onClick={handleCreateNewRun}
            className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all border border-white/20 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>{lang === 'ar' ? 'إنشاء مسير جديد' : 'Create New Run'}</span>
          </button>
          
          <button 
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 transition-all"
            onClick={() => triggerAlert(lang === 'ar' ? 'خيارات إضافية للمسير...' : 'Additional options...')}
          >
            <MoreHorizontal size={16} />
          </button>

          <button 
            onClick={handleExportData}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
          >
            <Download size={14} />
            <span>{lang === 'ar' ? 'تصدير' : 'Export'}</span>
          </button>

          <button 
            onClick={handleRecalculate}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
          >
            <span>{lang === 'ar' ? 'إعادة احتساب' : 'Recalculate'}</span>
          </button>

          <button 
            onClick={handleCancelApproval}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
          >
            <span>{lang === 'ar' ? 'إلغاء الاعتماد' : 'Cancel Approval'}</span>
          </button>

          <button 
            onClick={handleApprovePayroll}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg hover:shadow-[#7C3AED]/20 transition-all border border-white/15 flex items-center gap-2"
          >
            <Check size={16} />
            <span>{lang === 'ar' ? 'اعتماد المسير' : 'Approve Payroll'}</span>
          </button>
        </div>

        {/* Filters Right (RTL layout: floats right) */}
        <div className="flex items-center gap-3 w-full xl:w-auto xl:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute right-3.5 top-3 text-slate-400" size={16} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 glass-input rounded-xl text-xs font-bold text-white focus:outline-none text-right"
              placeholder={lang === 'ar' ? 'البحث...' : 'Search...'}
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2.5 glass-input text-xs font-bold text-white focus:outline-none cursor-pointer text-right min-w-[130px]"
            >
              <option value="all">{lang === 'ar' ? 'يوليو 2025' : 'July 2025'}</option>
              <option value="june">{lang === 'ar' ? 'يونيو 2025' : 'June 2025'}</option>
              <option value="may">{lang === 'ar' ? 'مايو 2025' : 'May 2025'}</option>
            </select>

            <select 
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-4 py-2.5 glass-input text-xs font-bold text-white focus:outline-none cursor-pointer text-right min-w-[100px]"
            >
              <option value="all">{lang === 'ar' ? 'الكل' : 'All'}</option>
              <option value="completed">{lang === 'ar' ? 'مكتمل' : 'Completed'}</option>
              <option value="approved">{lang === 'ar' ? 'معتمد' : 'Approved'}</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Content Area based on Active Sub-tab */}
      {activeSubTab === 'payroll_run' && (
        <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'اسم المسير' : 'Run Name'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الفترة' : 'Period'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'عدد الموظفين' : 'Employees'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'إجمالي الرواتب' : 'Total Payroll'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'تاريخ الاعتماد' : 'Approved Date'}</th>
                  <th className="py-4 px-6 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payrollRuns.map((run, index) => (
                  <tr key={run.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-4 px-6 text-white">{lang === 'ar' ? run.name : run.nameEn}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">{run.period}</td>
                    <td className="py-4 px-6 font-mono text-white">{run.employees}</td>
                    <td className="py-4 px-6 font-mono text-white">{run.total.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        run.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : run.status === 'approved'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-white/5 text-slate-450'
                      }`}>
                        {run.status === 'completed' && (lang === 'ar' ? 'مكتمل' : 'Completed')}
                        {run.status === 'approved' && (lang === 'ar' ? 'معتمد' : 'Approved')}
                        {run.status === 'draft' && (lang === 'ar' ? 'مسودة' : 'Draft')}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">{run.createdDate}</td>
                    <td className="py-4 px-6 font-mono text-slate-250">
                      <span className="flex items-center gap-1.5 justify-end">
                        {run.status !== 'draft' && <UserCheck size={14} className="text-emerald-400 shrink-0" />}
                        <span>{run.status === 'draft' ? '-' : run.approvedDate}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl transition-all" title={lang === 'ar' ? 'عرض التفاصيل' : 'View Run'}>
                          <Eye size={13} />
                        </button>
                        <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl transition-all" title={lang === 'ar' ? 'تحميل كشف البنك' : 'Download Bank File'}>
                          <Download size={13} />
                        </button>
                        <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl transition-all">
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-400">
            <span className={lang === 'ar' ? 'text-right' : 'text-left'}>
              {lang === 'ar' 
                ? `عرض 1 إلى ${payrollRuns.length} من 24 مسير` 
                : `Showing 1 to ${payrollRuns.length} of 24 payroll runs`}
            </span>
            <div className="flex items-center gap-2" dir="ltr">
              <button className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"><ChevronLeft size={16} /></button>
              <button className="w-7 h-7 bg-[#7C3AED] text-white flex items-center justify-center rounded-lg shadow-md">1</button>
              <button className="w-7 h-7 bg-white/5 hover:bg-white/10 text-slate-350 flex items-center justify-center rounded-lg">2</button>
              <button className="w-7 h-7 bg-white/5 hover:bg-white/10 text-slate-350 flex items-center justify-center rounded-lg">3</button>
              <button className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Employees Basic Salaries Sub-tab */}
      {activeSubTab === 'basic_salaries' && (
        <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'اسم البنك' : 'Bank Name'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الآيبان IBAN' : 'IBAN'}</th>
                  <th className="py-4 px-6 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img src={emp.avatar} className="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0" />
                      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <p className="font-bold text-white">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{emp.title} ({emp.empNo})</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-white">{(emp.baseSalary ?? emp.salary ?? 0).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.paymentMethod === 'cash' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {emp.paymentMethod === 'cash' ? (lang === 'ar' ? 'نقدي' : 'Cash') : (lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{emp.bankName || (lang === 'ar' ? 'غير مسجل' : 'Not setup')}</td>
                    <td className="py-4 px-6 font-mono text-slate-400 truncate max-w-[150px]">{emp.iban || '-'}</td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => startEdit(emp)}
                        className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-[#06B6D4] text-slate-350 rounded-xl transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contracts Sub-tab */}
      {activeSubTab === 'contracts' && (
        <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'نوع العقد' : 'Contract Type'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'البدلات' : 'Allowances'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contracts.map(contract => (
                  <tr key={contract.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                    <td className="py-4 px-6 text-white font-bold">{contract.empName}</td>
                    <td className="py-4 px-6 text-slate-300">{lang === 'ar' ? contract.type : contract.typeEn}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">{contract.start}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">{contract.end}</td>
                    <td className="py-4 px-6 font-mono text-white">{contract.basic.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="py-4 px-6 font-mono text-slate-400">+{contract.allow.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 uppercase">
                        {lang === 'ar' ? 'نشط' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salary Structures Sub-tab */}
      {activeSubTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {structures.map(struct => (
            <div key={struct.id} className="glass-card p-6 border border-white/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-xs font-black text-white">{lang === 'ar' ? struct.name : struct.nameEn}</h4>
                <div className="p-2 bg-[#06B6D4]/10 text-[#06B6D4] rounded-lg">
                  <Briefcase size={16} />
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'ar' ? 'نطاق الراتب الأساسي:' : 'Basic Range:'}</span>
                  <span className="text-white font-bold">{struct.basicRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'ar' ? 'بدل سكن مقرر:' : 'Housing Allowance:'}</span>
                  <span className="text-slate-200">{struct.housing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'ar' ? 'بدل نقل مقرر:' : 'Transportation Allowance:'}</span>
                  <span className="text-slate-200">{struct.transport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'ar' ? 'تأمين طبي:' : 'Health Insurance:'}</span>
                  <span className="text-slate-200">{struct.insurance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{lang === 'ar' ? 'خصم التأمينات الاجتماعية (GOSI):' : 'GOSI Setup:'}</span>
                  <span className="text-slate-200">{struct.gosi}</span>
                </div>
              </div>
              <button 
                onClick={() => triggerAlert(lang === 'ar' ? 'تم اختيار تعديل الهيكل' : 'Edit Structure Action')}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-slate-200 transition-all text-center block"
              >
                {lang === 'ar' ? 'تعديل بنود الهيكل' : 'Edit Structure Rules'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rules Setup Sub-tab */}
      {activeSubTab === 'rules' && (
        <div className="glass-card p-6 border border-white/5 shadow-sm space-y-6 animate-in fade-in duration-300">
          <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'قواعد احتساب الرواتب والجزاءات' : 'Payroll Calculation Rules'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-bold text-white">{lang === 'ar' ? 'قاعدة احتساب التأخير اليومي' : 'Daily Lateness Deduction Rules'}</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {lang === 'ar' ? 'يتم احتساب دقائق التأخير بعد فترة السماح (15 دقيقة) بالسعر الدقيق، ويتحول إلى خصم ربع يوم بعد ساعة كاملة، ونصف يوم بعد ساعتين.' 
                                 : 'Lateness minutes are deducted using detailed rates after a 15-minute grace period. 1+ hours late deducts 25% of a day, 2+ hours deducts 50%.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-bold text-white">{lang === 'ar' ? 'سعر ساعة العمل الإضافي (Overtime Multiplier)' : 'Overtime Rate Rule'}</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {lang === 'ar' ? 'تحسب ساعات العمل الإضافي في الأيام العادية بـ 1.5 من ساعة العمل العادية، وفي أيام العطلات الرسمية والأعياد تحسب بـ 2.0.' 
                                 : 'Overtime hours on normal business days are compensated at 1.5x regular base rate. Official holidays/weekends are paid at 2.0x base rate.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-bold text-white">{lang === 'ar' ? 'قواعد الغياب عن العمل (Absence Policies)' : 'Absence Deduction Rules'}</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {lang === 'ar' ? 'الغياب بدون عذر طبي أو موافقة مسبقة يخصم عليه يومين عمل كاملين من الراتب الأساسي مع توجيه إنذار تلقائي.' 
                                 : 'Absence without medical excuse or pre-approved leave leads to a 2.0x day deduction from base salary and triggers an automated warning.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-bold text-white">{lang === 'ar' ? 'خصومات الهيئة العامة للتأمينات الاجتماعية (GOSI)' : 'Social Insurance Deductions (GOSI)'}</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {lang === 'ar' ? 'خصم 9% تلقائياً من الراتب الأساسي وبدل السكن للموظفين المواطنين السعوديين، و 2% تأمين أخطار مهنية لجميع الموظفين.' 
                                 : '9% auto deduction from base salary + housing allowance for Saudi national employees, and 2% occupational hazards insurance for all.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loans Sub-tab */}
      {activeSubTab === 'loans' && (
        <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'إجمالي السلفة المعتمدة' : 'Total Approved Loan'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'مدة الأقساط' : 'Installments Period'}</th>
                  <th className="py-4 px-6 text-red-400">{lang === 'ar' ? 'القسط الشهري الجاري' : 'Monthly Installment'}</th>
                  <th className="py-4 px-6 text-emerald-400">{lang === 'ar' ? 'المبالغ المسددة' : 'Paid Amount'}</th>
                  <th className="py-4 px-6 text-slate-350">{lang === 'ar' ? 'المبالغ المتبقية' : 'Remaining Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.filter(e => (e.loanAmount ?? 0) > 0).map(emp => {
                  const total = emp.loanAmount ?? 0;
                  const inst = emp.loanInstallments ?? 1;
                  const monthly = Math.round(total / inst);
                  const paid = monthly * 2;
                  const rem = total - paid;

                  return (
                    <tr key={emp.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img src={emp.avatar} className="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0" />
                        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                          <p className="font-bold text-white">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{emp.title}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-white">{total.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                      <td className="py-4 px-6 font-mono text-slate-400">{inst} {lang === 'ar' ? 'شهور' : 'months'}</td>
                      <td className="py-4 px-6 font-mono text-red-400">-{monthly.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                      <td className="py-4 px-6 font-mono text-emerald-400">+{paid.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                      <td className="py-4 px-6 font-mono text-[#06B6D4] font-black">{rem.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bonuses Sub-tab */}
      {activeSubTab === 'bonuses' && (
        <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                  <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className="py-4 px-6 text-emerald-400">{lang === 'ar' ? 'قيمة المكافأة الاستثنائية' : 'Bonus Amount'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'السبب والوصف' : 'Reason / Note'}</th>
                  <th className="py-4 px-6 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img src={emp.avatar} className="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0" />
                      <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                        <p className="font-bold text-white">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{emp.title}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-emerald-400 font-black">+{emp.bonus ? emp.bonus.toLocaleString() : 0} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    <td className="py-4 px-6 text-slate-350">{emp.bonusReason || '-'}</td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => startEdit(emp)}
                        className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Sub-tab */}
      {activeSubTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Cost Report Summary */}
          <div className="glass-card p-6 border border-white/5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'تحليل هيكل الرواتب للأقسام' : 'Salaries Cost Breakdown by Department'}</h4>
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>{lang === 'ar' ? 'قسم التقنية والبرمجيات' : 'Technology & Engineering'}</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-[#7C3AED] h-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>{lang === 'ar' ? 'قسم المبيعات والتسويق' : 'Sales & Marketing'}</span>
                  <span>25%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-[#06B6D4] h-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>{lang === 'ar' ? 'قسم الموارد البشرية والعمليات' : 'HR & Operations'}</span>
                  <span>18%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-emerald-500 h-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-300">
                  <span>{lang === 'ar' ? 'قسم الإدارة العامة' : 'General & Executive'}</span>
                  <span>12%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-amber-500 h-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank File Details */}
          <div className="glass-card p-6 border border-white/5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'معايير التصدير لنظام التحويل بنظام حماية الأجور (WPS)' : 'Wage Protection System (WPS) Export Format'}</h4>
            <div className="space-y-3.5 text-xs text-slate-305 leading-relaxed font-bold">
              <p>
                {lang === 'ar' ? 'يقوم النظام تلقائياً بتوليد ملف WPS المتوافق مع متطلبات وزارة الموارد البشرية السعودية ومطابق لصيغة البنوك الكبرى (مثل الراجحي، الأهلي، والرياض).' 
                               : 'The system generates a standard WPS file configured exactly to Saudi Ministry of HR guidelines for direct upload to your business bank account.'}
              </p>
              <button 
                onClick={handleExportData}
                className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-xl text-xs font-black shadow-md hover:brightness-110 border border-white/20 transition-all flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet size={16} />
                {lang === 'ar' ? 'تصدير ملف حماية الأجور (WPS)' : 'Download Bank WPS File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sub-tab */}
      {activeSubTab === 'settings' && (
        <div className="glass-card p-6 border border-white/5 shadow-sm space-y-5 animate-in fade-in duration-300">
          <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'إعدادات النظام العامة للرواتب' : 'Payroll Configuration Settings'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-350">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 block">{lang === 'ar' ? 'يوم إصدار مسير الرواتب الشهري تلقائياً' : 'Automated Monthly Run Creation Day'}</label>
                <select className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer">
                  <option value="25">25 {lang === 'ar' ? 'من كل شهر ميلادي' : 'of the Gregorian month'}</option>
                  <option value="27">27 {lang === 'ar' ? 'من كل شهر ميلادي' : 'of the Gregorian month'}</option>
                  <option value="30">30 {lang === 'ar' ? 'من كل شهر ميلادي' : 'of the Gregorian month'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 block">{lang === 'ar' ? 'البنك الرئيسي المعتمد للحوالات' : 'Corporate Funding Bank Account'}</label>
                <select className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer">
                  <option value="rajhi">{lang === 'ar' ? 'مصرف الراجحي (Al Rajhi Bank)' : 'Al Rajhi Bank'}</option>
                  <option value="snb">{lang === 'ar' ? 'البنك الأهلي السعودي (SNB)' : 'Saudi National Bank (SNB)'}</option>
                  <option value="riyad">{lang === 'ar' ? 'بنك الرياض (Riyad Bank)' : 'Riyad Bank'}</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 block">{lang === 'ar' ? 'الرمز المؤسسي WPS للمنشأة بالبنك' : 'Corporate Bank WPS Code ID'}</label>
                <input 
                  type="text" 
                  defaultValue="WPS-MOL-998822" 
                  className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold text-white text-left font-mono" 
                />
              </div>

              <button 
                onClick={() => triggerAlert(lang === 'ar' ? 'تم حفظ إعدادات الرواتب بنجاح' : 'Payroll settings saved successfully')}
                className="w-full py-3 mt-4 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-xl text-xs font-black shadow-md hover:brightness-110 border border-white/20 transition-all"
              >
                {lang === 'ar' ? 'حفظ إعدادات الرواتب' : 'Save Configurations'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal Popup */}
      {selectedEmpId && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-6 font-sans">
          <div className="w-full max-w-xl glass-panel rounded-[2.5rem] shadow-2xl p-8 border border-white/5 space-y-6 animate-in zoom-in duration-200 text-right max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <button onClick={() => setSelectedEmpId(null)} className="p-2 text-slate-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{lang === 'ar' ? 'تعديل بنود الراتب للموظف' : 'Configure Employee Salaries'}</span>
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Basic Salary & Bank details */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-[#06B6D4] uppercase tracking-wider">{lang === 'ar' ? 'بيانات الراتب الأساسي وطريقة الدفع' : 'Basic Salary & Payments'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'الراتب الأساسي' : 'Base Salary'}</label>
                    <input 
                      type="number" 
                      value={editBaseSalary}
                      onChange={(e) => setEditBaseSalary(e.target.value)}
                      className="w-full px-4 py-3 glass-input text-xs font-bold text-white text-right" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</label>
                    <select 
                      value={editPaymentMethod}
                      onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                      className="w-full px-4 py-3 glass-input text-xs font-bold text-white text-right cursor-pointer"
                    >
                      <option value="bank_transfer">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                      <option value="cash">{lang === 'ar' ? 'نقدي' : 'Cash'}</option>
                    </select>
                  </div>
                </div>
                
                {editPaymentMethod === 'bank_transfer' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'اسم البنك' : 'Bank Name'}</label>
                      <input 
                        type="text" 
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        placeholder="e.g. Al Rajhi Bank"
                        className="w-full px-4 py-3 glass-input text-xs font-bold text-white text-right" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'رقم الآيبان IBAN' : 'IBAN Code'}</label>
                      <input 
                        type="text" 
                        value={editIban}
                        onChange={(e) => setEditIban(e.target.value)}
                        placeholder="SA03 8000 0000 ..."
                        className="w-full px-4 py-3 glass-input text-xs font-bold text-white font-mono text-left" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Allowances */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-black text-[#06B6D4] uppercase tracking-wider">{lang === 'ar' ? 'البدلات والمكافآت والخصومات' : 'Allowances, Bonuses & Deductions'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'بدل سكن' : 'Housing Allowance'}</label>
                    <input type="number" value={editAllowanceHousing} onChange={(e) => setEditAllowanceHousing(e.target.value)} className="w-full px-4 py-2 glass-input text-right text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'بدل نقل' : 'Transportation'}</label>
                    <input type="number" value={editAllowanceTransport} onChange={(e) => setEditAllowanceTransport(e.target.value)} className="w-full px-4 py-2 glass-input text-right text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'مكافأة استثنائية' : 'Bonus'}</label>
                    <input type="number" value={editBonus} onChange={(e) => setEditBonus(e.target.value)} className="w-full px-4 py-2 glass-input text-right text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ar' ? 'خصم غياب/تأخير' : 'Deductions'}</label>
                    <input type="number" value={editDeductionAbsence} onChange={(e) => setEditDeductionAbsence(e.target.value)} className="w-full px-4 py-2 glass-input text-right text-xs" />
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setSelectedEmpId(null)}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-350 hover:bg-white/10 hover:text-white transition-all"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-xl text-xs font-black shadow-md hover:brightness-110 transition-all border border-white/20"
                >
                  {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ البيانات' : 'Save Details')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};