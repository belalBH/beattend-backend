import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Users, 
  Plus, 
  Search, 
  Check, 
  X, 
  Clock, 
  CheckCircle,
  RefreshCw,
  Sliders,
  ListCollapse
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
  avatar: string;
}

interface LeaveRequest {
  id: number;
  empId: number;
  empName: string;
  empTitle: string;
  empAvatar: string;
  type: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

interface LeaveBalance {
  empId: number;
  empName: string;
  empNo: string;
  empTitle: string;
  empAvatar: string;
  annualTotal: number;
  annualUsed: number;
  sickUsed: number;
  emergencyUsed: number;
}

interface LeaveType {
  id: string;
  nameAr: string;
  nameEn: string;
  days: number;
  paid: boolean;
}

export const LeavesView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'request' | 'approve' | 'balance' | 'types'>('request');
  const [searchTerm, setSearchTerm] = useState('');
  const [successAlert, setSuccessAlert] = useState('');

  // Form states
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [leaveType, setLeaveType] = useState<string>('annual');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Master leaves state
  const [requests, setRequests] = useState<LeaveRequest[]>([
    {
      id: 1,
      empId: 1,
      empName: 'أحمد العتيبي',
      empTitle: 'مطور برمجيات أول',
      empAvatar: 'https://ui-avatars.com/api/?name=%D8%A3%D8%AD%D9%85%D8%AF+%D8%A7%D9%84%D8%B9%D8%AA%D9%8A%D8%A8%D9%8A&background=7C3AED&color=fff',
      type: 'annual',
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      duration: 14,
      reason: 'الإجازة السنوية المعتادة لقضاء وقت مع العائلة',
      status: 'approved',
      requestDate: '2026-06-20'
    },
    {
      id: 2,
      empId: 2,
      empName: 'سارة الغامدي',
      empTitle: 'مصممة واجهات أولى',
      empAvatar: 'https://ui-avatars.com/api/?name=%D8%B3%D8%A7%D8%B1%D8%A9+%D8%A7%D9%84%D8%BA%D8%A7%D9%85%D8%AF%D9%8A&background=10B981&color=fff',
      type: 'sick',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      duration: 2,
      reason: 'موعد طبي طارئ مع راحة طبية موثقة',
      status: 'approved',
      requestDate: '2026-06-09'
    },
    {
      id: 3,
      empId: 3,
      empName: 'خالد الدوسري',
      empTitle: 'مهندس جودة برمجيات',
      empAvatar: 'https://ui-avatars.com/api/?name=%D8%AE%D8%A7%D9%84%D8%AF+%D8%A7%D9%84%D8%AF%D9%88%D8%B3%D8%B1%D9%8A&background=3B82F6&color=fff',
      type: 'annual',
      startDate: '2026-08-01',
      endDate: '2026-08-10',
      duration: 9,
      reason: 'السفر لقضاء العطلة الصيفية',
      status: 'pending',
      requestDate: '2026-06-22'
    },
    {
      id: 4,
      empId: 4,
      empName: 'أسماء الشمري',
      empTitle: 'مديرة الموارد البشرية',
      empAvatar: 'https://ui-avatars.com/api/?name=%D8%A3%D8%B3%D9%85%D8%A7%D8%A1+%D8%A7%D9%84%D8%B4%D9%85%D8%B1%D9%8A&background=F59E0B&color=fff',
      type: 'emergency',
      startDate: '2026-06-25',
      endDate: '2026-06-26',
      duration: 1,
      reason: 'ظروف عائلية طارئة ومستعجلة',
      status: 'pending',
      requestDate: '2026-06-23'
    }
  ]);

  // Master leaves balance
  const [balances, setBalances] = useState<LeaveBalance[]>([
    { empId: 1, empNo: 'EMP-1001', empName: 'أحمد العتيبي', empTitle: 'مطور برمجيات أول', empAvatar: 'https://ui-avatars.com/api/?name=%D8%A3%D8%AD%D9%85%D8%AF+%D8%A7%D9%84%D8%B9%D8%AA%D9%8A%D8%A8%D9%8A&background=7C3AED&color=fff', annualTotal: 30, annualUsed: 14, sickUsed: 0, emergencyUsed: 0 },
    { empId: 2, empNo: 'EMP-1002', empName: 'سارة الغامدي', empTitle: 'مصممة واجهات أولى', empAvatar: 'https://ui-avatars.com/api/?name=%D8%B3%D8%A7%D8%B1%D8%A9+%D8%A7%D9%84%D8%BA%D8%A7%D9%85%D8%AF%D9%8A&background=10B981&color=fff', annualTotal: 30, annualUsed: 0, sickUsed: 2, emergencyUsed: 0 },
    { empId: 3, empNo: 'EMP-1003', empName: 'خالد الدوسري', empTitle: 'مهندس جودة برمجيات', empAvatar: 'https://ui-avatars.com/api/?name=%D8%AE%D8%A7%D9%84%D8%AF+%D8%A7%D9%84%D8%AF%D9%88%D8%B3%D8%B1%D9%8A&background=3B82F6&color=fff', annualTotal: 30, annualUsed: 0, sickUsed: 0, emergencyUsed: 0 },
    { empId: 4, empNo: 'EMP-1004', empName: 'أسماء الشمري', empTitle: 'مديرة الموارد البشرية', empAvatar: 'https://ui-avatars.com/api/?name=%D8%A3%D8%B3%D9%85%D8%A7%D8%A1+%D8%A7%D9%84%D8%B4%D9%85%D8%B1%D9%8A&background=F59E0B&color=fff', annualTotal: 30, annualUsed: 0, sickUsed: 0, emergencyUsed: 1 }
  ]);

  // Master leaves types
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    { id: 'annual', nameAr: 'إجازة سنوية', nameEn: 'Annual Leave', days: 30, paid: true },
    { id: 'sick', nameAr: 'إجازة مرضية', nameEn: 'Sick Leave', days: 15, paid: true },
    { id: 'emergency', nameAr: 'إجازة اضطرارية', nameEn: 'Emergency Leave', days: 5, paid: true },
    { id: 'unpaid', nameAr: 'إجازة بدون راتب', nameEn: 'Unpaid Leave', days: 90, paid: false }
  ]);

  // New leave type form states
  const [newTypeNameAr, setNewTypeNameAr] = useState('');
  const [newTypeNameEn, setNewTypeNameEn] = useState('');
  const [newTypeDays, setNewTypeDays] = useState('30');
  const [newTypePaid, setNewTypePaid] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
        // Map any missing balances dynamically if they aren't seeded
        const updatedBalances = [...balances];
        data.forEach((e: Employee) => {
          if (!updatedBalances.find(b => b.empId === e.id)) {
            updatedBalances.push({
              empId: e.id,
              empNo: e.empNo || `EMP-${1000 + e.id}`,
              empName: e.name,
              empTitle: e.title,
              empAvatar: e.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(e.name)}&background=7C3AED&color=fff`,
              annualTotal: 30,
              annualUsed: 0,
              sickUsed: 0,
              emergencyUsed: 0
            });
          }
        });
        setBalances(updatedBalances);
      }
    } catch (e) {
      console.error("Error fetching employees for leaves:", e);
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

  // Submit new leave request
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !startDate || !endDate) return;

    const emp = employees.find(emp => emp.id === parseInt(selectedEmpId));
    if (!emp) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (daysDiff <= 0) {
      alert(lang === 'ar' ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' : 'End date must be after start date');
      return;
    }

    const newRequest: LeaveRequest = {
      id: requests.length + 1,
      empId: emp.id,
      empName: emp.name,
      empTitle: emp.title,
      empAvatar: emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=7C3AED&color=fff`,
      type: leaveType,
      startDate,
      endDate,
      duration: daysDiff,
      reason,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]
    };

    setRequests([newRequest, ...requests]);
    setSelectedEmpId('');
    setStartDate('');
    setEndDate('');
    setReason('');
    triggerAlert(lang === 'ar' ? 'تم تقديم طلب الإجازة بنجاح وهو تحت المراجعة' : 'Leave request submitted successfully and is under review');
  };

  // Approve leave request
  const handleApprove = (id: number) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        // Update balance
        setBalances(bPrev => bPrev.map(b => {
          if (b.empId === req.empId) {
            if (req.type === 'annual') {
              return { ...b, annualUsed: b.annualUsed + req.duration };
            } else if (req.type === 'sick') {
              return { ...b, sickUsed: b.sickUsed + req.duration };
            } else if (req.type === 'emergency') {
              return { ...b, emergencyUsed: b.emergencyUsed + req.duration };
            }
          }
          return b;
        }));
        return { ...req, status: 'approved' };
      }
      return req;
    }));
    triggerAlert(lang === 'ar' ? 'تم اعتماد طلب الإجازة بنجاح خصمه من الرصيد' : 'Leave request approved successfully and deducted from balance');
  };

  // Reject leave request
  const handleReject = (id: number) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: 'rejected' };
      }
      return req;
    }));
    triggerAlert(lang === 'ar' ? 'تم رفض طلب الإجازة بنجاح' : 'Leave request rejected successfully');
  };

  // Add new leave type
  const handleAddLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeNameAr || !newTypeNameEn) return;

    const newType: LeaveType = {
      id: newTypeNameEn.toLowerCase().replace(/\s+/g, '_'),
      nameAr: newTypeNameAr,
      nameEn: newTypeNameEn,
      days: parseInt(newTypeDays) || 30,
      paid: newTypePaid
    };

    setLeaveTypes([...leaveTypes, newType]);
    setNewTypeNameAr('');
    setNewTypeNameEn('');
    setNewTypeDays('30');
    setNewTypePaid(true);
    triggerAlert(lang === 'ar' ? 'تمت إضافة نوع الإجازة الجديد بنجاح' : 'New leave type added successfully');
  };

  // Filtered requests
  const filteredRequests = requests.filter(req => {
    return req.empName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           req.reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTypeName = (typeId: string) => {
    const type = leaveTypes.find(t => t.id === typeId);
    if (!type) return typeId;
    return lang === 'ar' ? type.nameAr : type.nameEn;
  };

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
            {lang === 'ar' ? 'نظام إدارة الإجازات والغياب' : 'Leaves & Absences Management System'}
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {lang === 'ar' ? 'تقديم طلبات الإجازة للموظفين، اعتماد الطلبات، متابعة الأرصدة وإعداد أنواع الإجازات' : 'Submit leave requests, approve pending requests, track balances, and define policy types.'}
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
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar gap-6">
        {[
          { id: 'request', label: lang === 'ar' ? 'طلب إجازة ومتابعة' : 'Submit & Track Leaves' },
          { id: 'approve', label: lang === 'ar' ? 'اعتماد الإجازات' : 'Approve Requests' },
          { id: 'balance', label: lang === 'ar' ? 'أرصدة الموظفين' : 'Employee Balances' },
          { id: 'types', label: lang === 'ar' ? 'إعداد أنواع الإجازات' : 'Leave Types Setup' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id as any); }}
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

      {/* 1. Request and Track Tab */}
      {activeSubTab === 'request' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submit form */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm space-y-5 h-fit">
            <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'تقديم طلب إجازة جديد' : 'Submit New Leave Request'}</h3>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'الموظف' : 'Employee'}</label>
                <select 
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white text-right"
                >
                  <option value="">{lang === 'ar' ? '-- اختر الموظف --' : '-- Select Employee --'}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.title})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'نوع الإجازة' : 'Leave Type'}</label>
                <select 
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                >
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{lang === 'ar' ? t.nameAr : t.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'من تاريخ' : 'Start Date'}</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'إلى تاريخ' : 'End Date'}</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'سبب الإجازة' : 'Reason'}</label>
                <textarea 
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={lang === 'ar' ? 'شرح سبب طلب الإجازة...' : 'Explain the reason...'}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] text-right"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#17AE9F] text-white rounded-xl text-xs font-black shadow-md hover:bg-[#15385E] transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                {lang === 'ar' ? 'إرسال طلب الإجازة' : 'Submit Leave Request'}
              </button>
            </form>
          </div>

          {/* Leaves log list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-gray-100/70 shadow-sm">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute right-3.5 top-3 text-gray-400" size={16} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none text-right"
                  placeholder={lang === 'ar' ? 'البحث عن موظف أو إجازة...' : 'Search employee or leave...'}
                />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100/70 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                      <th className="py-4 px-6">{lang === 'ar' ? 'نوع الإجازة' : 'Leave Type'}</th>
                      <th className="py-4 px-6">{lang === 'ar' ? 'الفترة' : 'Period'}</th>
                      <th className="py-4 px-6">{lang === 'ar' ? 'المدة' : 'Duration'}</th>
                      <th className="py-4 px-6">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-bold">
                          {lang === 'ar' ? 'لا توجد طلبات إجازة تطابق البحث' : 'No leave requests matching search'}
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50/50 text-xs font-bold text-gray-700 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img src={req.empAvatar} className="w-8 h-8 rounded-xl object-cover border border-white/10" />
                              <div>
                                <p className="font-bold text-white">{req.empName}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{req.empTitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white">{getTypeName(req.type)}</td>
                          <td className="py-4 px-6">
                            <span className="text-gray-300 font-mono">{req.startDate}</span>
                            <span className="mx-1.5 text-gray-500">→</span>
                            <span className="text-gray-300 font-mono">{req.endDate}</span>
                          </td>
                          <td className="py-4 px-6 font-mono text-white">{req.duration} {lang === 'ar' ? 'أيام' : 'days'}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              req.status === 'approved' 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : req.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {req.status === 'approved' && (lang === 'ar' ? 'معتمد' : 'Approved')}
                              {req.status === 'rejected' && (lang === 'ar' ? 'مرفوض' : 'Rejected')}
                              {req.status === 'pending' && (lang === 'ar' ? 'قيد المراجعة' : 'Pending')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Approve Requests Tab */}
      {activeSubTab === 'approve' && (
        <div className="bg-white rounded-[2rem] border border-gray-100/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'نوع الإجازة' : 'Leave Type'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الفترة والمدة' : 'Period & Duration'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'السبب المذكور' : 'Reason'}</th>
                  <th className="py-4 px-6 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.filter(req => req.status === 'pending').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-gray-400 font-bold">
                      {lang === 'ar' ? 'لا توجد طلبات معلقة بانتظار الاعتماد 👍' : 'No pending leave requests awaiting approval 👍'}
                    </td>
                  </tr>
                ) : (
                  requests.filter(req => req.status === 'pending').map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/50 text-xs font-bold text-gray-700 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={req.empAvatar} className="w-8.5 h-8.5 rounded-xl object-cover border border-white/10" />
                          <div>
                            <p className="font-bold text-white">{req.empName}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{req.empTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white">{getTypeName(req.type)}</td>
                      <td className="py-4 px-6">
                        <p className="text-gray-300 font-mono">{req.startDate} {lang === 'ar' ? 'إلى' : 'to'} {req.endDate}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-bold">({req.duration} {lang === 'ar' ? 'أيام' : 'days'})</p>
                      </td>
                      <td className="py-4 px-6 text-gray-300 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleReject(req.id)}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                            title={lang === 'ar' ? 'رفض الطلب' : 'Reject Request'}
                          >
                            <X size={14} />
                          </button>
                          <button 
                            onClick={() => handleApprove(req.id)}
                            className="bg-[#17AE9F] text-white px-3 py-2 rounded-xl text-[10px] font-black flex items-center gap-1 hover:bg-[#15385E] transition-all"
                          >
                            <Check size={12} />
                            {lang === 'ar' ? 'اعتماد الإجازة' : 'Approve'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Employee Balances Tab */}
      {activeSubTab === 'balance' && (
        <div className="bg-white rounded-[2rem] border border-gray-100/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                  <th className="py-4 px-6">{lang === 'ar' ? 'الرصيد السنوي الإجمالي' : 'Total Annual'}</th>
                  <th className="py-4 px-6 text-emerald-500">{lang === 'ar' ? 'المستخدم (سنوي)' : 'Used (Annual)'}</th>
                  <th className="py-4 px-6 text-blue-500">{lang === 'ar' ? 'المستخدم (مرضي)' : 'Used (Sick)'}</th>
                  <th className="py-4 px-6 text-amber-500">{lang === 'ar' ? 'المستخدم (اضطراري)' : 'Used (Emergency)'}</th>
                  <th className="py-4 px-6 text-center">{lang === 'ar' ? 'الرصيد السنوي المتبقي' : 'Remaining Annual'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {balances.map(b => (
                  <tr key={b.empId} className="hover:bg-gray-50/50 text-xs font-bold text-gray-700 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={b.empAvatar} className="w-8.5 h-8.5 rounded-xl object-cover border border-white/10" />
                        <div>
                          <p className="font-bold text-white">{b.empName}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{b.empNo} • {b.empTitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-white">{b.annualTotal} {lang === 'ar' ? 'يوم' : 'days'}</td>
                    <td className="py-4 px-6 font-mono text-emerald-400">{b.annualUsed} {lang === 'ar' ? 'يوم' : 'days'}</td>
                    <td className="py-4 px-6 font-mono text-blue-400">{b.sickUsed} {lang === 'ar' ? 'يوم' : 'days'}</td>
                    <td className="py-4 px-6 font-mono text-amber-400">{b.emergencyUsed} {lang === 'ar' ? 'يوم' : 'days'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs ${
                        b.annualTotal - b.annualUsed <= 5 
                          ? 'bg-red-500/10 text-red-400' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {b.annualTotal - b.annualUsed} {lang === 'ar' ? 'يوم متبقي' : 'days left'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Leave Types Setup Tab */}
      {activeSubTab === 'types' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add leave type form */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm space-y-5 h-fit">
            <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'إضافة نوع إجازة جديد' : 'Create New Leave Type'}</h3>
            <form onSubmit={handleAddLeaveType} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'اسم الإجازة بالعربية' : 'Leave Name (AR)'}</label>
                <input 
                  type="text"
                  required
                  value={newTypeNameAr}
                  onChange={(e) => setNewTypeNameAr(e.target.value)}
                  placeholder="مثال: إجازة زواج"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'اسم الإجازة بالإنجليزية' : 'Leave Name (EN)'}</label>
                <input 
                  type="text"
                  required
                  value={newTypeNameEn}
                  onChange={(e) => setNewTypeNameEn(e.target.value)}
                  placeholder="e.g. Marriage Leave"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] text-left"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 block">{lang === 'ar' ? 'عدد الأيام المسموح بها' : 'Limit of Days'}</label>
                <input 
                  type="number"
                  required
                  value={newTypeDays}
                  onChange={(e) => setNewTypeDays(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none text-right font-mono"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-white">{lang === 'ar' ? 'مدفوعة الراتب كاملة؟' : 'Is Fully Paid?'}</span>
                <input 
                  type="checkbox"
                  checked={newTypePaid}
                  onChange={(e) => setNewTypePaid(e.target.checked)}
                  className="w-4 h-4 rounded text-[#17AE9F] border-gray-300 focus:ring-[#17AE9F]"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#17AE9F] text-white rounded-xl text-xs font-black shadow-md hover:bg-[#15385E] transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                {lang === 'ar' ? 'إضافة نوع الإجازة' : 'Add Leave Type'}
              </button>
            </form>
          </div>

          {/* List of leave types */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100/70 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'أنواع الإجازات المفعلة بالنظام' : 'Active Leave Types & Rules'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveTypes.map(type => (
                <div key={type.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex justify-between items-center group hover:border-[#17AE9F]/30 transition-all duration-300">
                  <div>
                    <h4 className="text-xs font-black text-white">{lang === 'ar' ? type.nameAr : type.nameEn}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold">
                      {lang === 'ar' ? `الحد الأقصى: ${type.days} يوم` : `Limit: ${type.days} days`}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                    type.paid 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {type.paid ? (lang === 'ar' ? 'مدفوعة الأجر' : 'Paid') : (lang === 'ar' ? 'غير مدفوعة' : 'Unpaid')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
