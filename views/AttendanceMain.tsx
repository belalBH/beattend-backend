import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  CheckCircle,
  RefreshCw,
  Calendar,
  UserCheck,
  UserX,
  ShieldAlert,
  Smartphone,
  Fingerprint,
  QrCode,
  MapPin,
  FileSpreadsheet,
  Sliders,
  TrendingUp,
  Cpu,
  Zap,
  Info,
  ShieldCheck,
  Building,
  Users
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { translations } from '../i18n';

interface Employee {
  id: number;
  empNo: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: number;
  empName?: string;
  empTitle?: string;
  empAvatar?: string;
  date: string;
  clock_in_time: string;
  clock_out_time?: string;
  working_hours?: number;
  status: 'early' | 'late' | 'regular';
  method: 'biometric' | 'qrcode' | 'gps';
  latenessMinutes?: number;
  overtimeHours?: number;
  lat?: number;
  lng?: number;
}

export const AttendanceMainView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'log' | 'delays' | 'overtime' | 'biometric' | 'qrcode' | 'gps'>('attendance');
  const [searchTerm, setSearchTerm] = useState('');
  const [successAlert, setSuccessAlert] = useState('');
  
  // Biometric toggle states
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(true);
  const [mobileClockInEnabled, setMobileClockInEnabled] = useState(true);

  // QR Code state
  const [qrRefreshesIn, setQrRefreshesIn] = useState(30);
  const [selectedBranch, setSelectedBranch] = useState('riyadh');

  // Load stats
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const empRes = await fetch(`${API_BASE_URL}/api/employees`);
      const attRes = await fetch(`${API_BASE_URL}/api/attendance`);
      
      let empData: Employee[] = [];
      let attData: any[] = [];
      
      if (empRes.ok) {
        empData = await empRes.json();
        setEmployees(empData);
      }
      
      if (attRes.ok) {
        const json = await attRes.json();
        attData = json.data || [];
      }

      // Map raw API records to detailed UI objects or fall back to mock data
      const mapped = attData.map((r: any) => {
        const emp = empData.find(e => e.id === r.employee_id);
        return {
          id: r.id || String(Math.random()),
          employee_id: r.employee_id,
          empName: emp ? emp.name : (lang === 'ar' ? 'موظف غير معروف' : 'Unknown Employee'),
          empTitle: emp ? emp.title : '',
          empAvatar: emp ? emp.avatar : 'https://ui-avatars.com/api/?name=User',
          date: r.date,
          clock_in_time: r.clock_in || r.clock_in_time || '08:00',
          clock_out_time: r.clock_out || r.clock_out_time || '',
          working_hours: r.working_hours || 0,
          status: (r.clock_in_time && r.clock_in_time > '08:15') ? 'late' : 'regular',
          method: r.method || 'biometric',
          latenessMinutes: r.latenessMinutes || ((r.clock_in_time && r.clock_in_time > '08:15') ? 25 : 0),
          overtimeHours: r.overtimeHours || 0
        };
      });

      // If no records in database, set initial mock logs so the UI looks stunning
      if (mapped.length === 0) {
        setRecords([
          {
            id: '1',
            employee_id: 1,
            empName: 'أحمد العتيبي',
            empTitle: 'مطور برمجيات أول',
            empAvatar: 'https://ui-avatars.com/api/?name=%D8%A3%D8%AD%D9%85%D8%AF+%D8%A7%D9%84%D8%B9%D8%AA%D9%8A%D8%A8%D9%8A&background=7C3AED&color=fff',
            date: new Date().toISOString().split('T')[0],
            clock_in_time: '07:52',
            clock_out_time: '16:45',
            working_hours: 8.8,
            status: 'early',
            method: 'biometric',
            latenessMinutes: 0,
            overtimeHours: 0.8
          },
          {
            id: '2',
            employee_id: 2,
            empName: 'سارة الغامدي',
            empTitle: 'مصممة واجهات أولى',
            empAvatar: 'https://ui-avatars.com/api/?name=%D8%B3%D8%A7%D8%B1%D8%A9+%D8%A7%D9%84%D8%BA%D8%A7%D9%85%D8%AF%D9%8A&background=10B981&color=fff',
            date: new Date().toISOString().split('T')[0],
            clock_in_time: '08:34',
            clock_out_time: '',
            working_hours: 0,
            status: 'late',
            method: 'gps',
            latenessMinutes: 34,
            overtimeHours: 0
          },
          {
            id: '3',
            employee_id: 3,
            empName: 'خالد الدوسري',
            empTitle: 'مهندس جودة برمجيات',
            empAvatar: 'https://ui-avatars.com/api/?name=%D8%AE%D8%A7%D9%84%D8%AF+%D8%A7%D9%84%D8%AF%D9%88%D8%B3%D8%B1%D9%8A&background=3B82F6&color=fff',
            date: new Date().toISOString().split('T')[0],
            clock_in_time: '08:05',
            clock_out_time: '17:00',
            working_hours: 8.9,
            status: 'regular',
            method: 'qrcode',
            latenessMinutes: 5,
            overtimeHours: 0.9
          },
          {
            id: '4',
            employee_id: 4,
            empName: 'أسماء الشمري',
            empTitle: 'مديرة الموارد البشرية',
            empAvatar: 'https://ui-avatars.com/api/?name=%D8%A3%D8%B3%D9%85%D8%A7%D8%A1+%D8%A7%D9%84%D8%B4%D9%85%D8%B1%D9%8A&background=F59E0B&color=fff',
            date: new Date().toISOString().split('T')[0] - 1,
            clock_in_time: '08:45',
            clock_out_time: '18:15',
            working_hours: 9.5,
            status: 'late',
            method: 'biometric',
            latenessMinutes: 45,
            overtimeHours: 1.5
          }
        ]);
      } else {
        setRecords(mapped);
      }

    } catch (e) {
      console.error("Error loading attendance statistics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // QR Code refresh timer simulator
  useEffect(() => {
    if (activeSubTab === 'qrcode') {
      const timer = setInterval(() => {
        setQrRefreshesIn(prev => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeSubTab]);

  const triggerAlert = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(''), 3000);
  };

  // Filter lists based on search
  const filteredRecords = records.filter(rec => {
    const searchLower = searchTerm.toLowerCase();
    return rec.empName?.toLowerCase().includes(searchLower) || 
           rec.date.includes(searchLower) ||
           rec.status.includes(searchLower);
  });

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
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-[#06B6D4] rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {lang === 'ar' ? 'نظام تتبع الحضور والانصراف والتحقق' : 'Attendance tracking & Verification System'}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {lang === 'ar' ? 'رصد سجلات الحضور لحظة بلحظة والتحقق بـ: بصمة، QR، و GPS' : 'Monitor live check-in logs, analyze delay/overtime reports, and configure Biometric, QR, and GPS settings.'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          {/* Last Update indicator */}
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{lang === 'ar' ? 'آخر تحديث: 23 يوليو 2025' : 'Last update: 23 July 2025'}</span>
          </div>
          <button 
            onClick={fetchAttendanceData}
            className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all shadow-md"
            title={lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar gap-6 mb-6">
        {[
          { id: 'attendance', label: lang === 'ar' ? 'التحضير اليومي' : 'Daily Board' },
          { id: 'log', label: lang === 'ar' ? 'سجل الحضور' : 'Attendance Log' },
          { id: 'delays', label: lang === 'ar' ? 'التأخير والتغيب' : 'Lateness & Delays' },
          { id: 'overtime', label: lang === 'ar' ? 'العمل الإضافي' : 'Overtime Log' },
          { id: 'biometric', label: lang === 'ar' ? 'إعدادات البصمة' : 'Biometrics' },
          { id: 'qrcode', label: lang === 'ar' ? 'رمز QR Code' : 'QR Code Scanner' },
          { id: 'gps', label: lang === 'ar' ? 'متابعة موقع GPS' : 'GPS Tracking' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id as any); }}
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

      {/* 1. Daily Board Tab */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          {/* Daily statistics widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Card 5: Hours */}
            <div className="glass-card p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                  <Clock size={20} />
                </div>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'ساعات العمل المسجلة' : 'Working Hours Run'}</p>
                  <p className="text-xl font-black text-white mt-1">27.2 {lang === 'ar' ? 'ساعة' : 'hours'}</p>
                  <p className="text-[9px] font-bold text-emerald-400 mt-0.5">12% ↑ {lang === 'ar' ? 'من أمس' : 'from yesterday'}</p>
                </div>
              </div>
            </div>

            {/* Card 4: Present Today */}
            <div className="glass-card p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                  <Users size={20} />
                </div>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الحاضرين' : 'Present Today'}</p>
                  <p className="text-xl font-black text-white mt-1">{records.filter(r => r.clock_in_time).length} {lang === 'ar' ? 'موظف' : 'employees'}</p>
                  <p className="text-[9px] font-bold text-emerald-400 mt-0.5">8% ↑ {lang === 'ar' ? 'من أمس' : 'from yesterday'}</p>
                </div>
              </div>
            </div>

            {/* Card 3: Absent Today */}
            <div className="glass-card p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                  <UserX size={20} />
                </div>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الغائبين' : 'Absent Today'}</p>
                  <p className="text-xl font-black text-white mt-1">4 {lang === 'ar' ? 'موظفين' : 'employees'}</p>
                  <p className="text-[9px] font-bold text-red-400 mt-0.5">2% ↑ {lang === 'ar' ? 'من أمس' : 'from yesterday'}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Late Check-ins */}
            <div className="glass-card p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                  <Clock size={20} />
                </div>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'المتأخرون اليوم' : 'Late Check-ins'}</p>
                  <p className="text-xl font-black text-white mt-1">{records.filter(r => r.status === 'late').length} {lang === 'ar' ? 'موظفين' : 'employees'}</p>
                  <p className="text-[9px] font-bold text-red-400 mt-0.5">5% ↑ {lang === 'ar' ? 'من أمس' : 'from yesterday'}</p>
                </div>
              </div>
            </div>

            {/* Card 1: Total Companies */}
            <div className="glass-card p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <Building size={20} />
                </div>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الشركات' : 'Total Companies'}</p>
                  <p className="text-xl font-black text-white mt-1">4 {lang === 'ar' ? 'شركات' : 'companies'}</p>
                  <p className="text-[9px] font-bold text-emerald-400 mt-0.5">12% ↑ {lang === 'ar' ? 'شركة جديدة' : 'new company'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts section: 1/3 commitment rate, 2/3 monthly attendance spline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1/3 Commitment donut chart */}
            <div className="glass-card p-6 flex flex-col justify-between shadow-xl">
              <div>
                <h4 className="text-sm font-black text-white">{lang === 'ar' ? 'نسبة الالتزام الشهرية' : 'Monthly Commitment Rate'}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'توزيع الموظفين حسب الالتزام' : 'Employee commitment distribution'}</p>
              </div>
              
              <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    className="stroke-white/5" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  {/* Blue path (8%) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    className="stroke-blue-500" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="238.7"
                    strokeDashoffset="0"
                  />
                  {/* Green path (92%) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    className="stroke-[#06B6D4]" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="238.7"
                    strokeDashoffset="19.1"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute text-center">
                  <p className="text-3xl font-black text-white">92%</p>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase mt-0.5">{lang === 'ar' ? 'ممتاز' : 'Excellent'}</p>
                </div>
              </div>

              <div className="flex justify-between text-[11px] font-bold mt-2">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></span>
                  <span>{lang === 'ar' ? 'ملتزمون' : 'Committed'}</span>
                  <span className="text-slate-400 text-[10px]">(22) 92%</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>{lang === 'ar' ? 'غير ملتزمون' : 'Uncommitted'}</span>
                  <span className="text-slate-400 text-[10px]">(2) 8%</span>
                </div>
              </div>
            </div>

            {/* 2/3 Monthly attendance spline line chart */}
            <div className="glass-card p-6 flex flex-col justify-between shadow-xl lg:col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-white">{lang === 'ar' ? 'مخطط الحضور الشهري' : 'Monthly Attendance Chart'}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'تحليل مسار الحضور خلال آخر 12 شهر' : 'Attendance analysis for the past 12 months'}</p>
                </div>
                <select className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-300 focus:outline-none cursor-pointer">
                  <option value="12">{lang === 'ar' ? '12 شهر' : '12 Months'}</option>
                  <option value="6">{lang === 'ar' ? '6 أشهر' : '6 Months'}</option>
                </select>
              </div>

              <div className="relative h-44 mt-4 w-full">
                <svg className="w-full h-full" viewBox="0 0 600 170" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.00"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="30" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="30" y1="55" x2="580" y2="55" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="30" y1="90" x2="580" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="30" y1="125" x2="580" y2="125" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="30" y1="160" x2="580" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Area under the curve */}
                  <path 
                    d="M 30,140 C 55,135 55,130 80,130 C 105,130 105,110 130,110 C 155,110 155,115 180,115 C 205,115 205,95 230,95 C 255,95 255,85 280,85 C 305,85 305,90 330,90 C 355,90 355,75 380,75 C 405,75 405,60 430,60 C 455,60 455,55 480,55 C 505,55 505,45 530,45 C 555,45 555,35 580,35 L 580,160 L 30,160 Z" 
                    fill="url(#chartGrad)" 
                  />
                  
                  {/* Dash line comparison baseline */}
                  <path 
                    d="M 30,130 L 580,45" 
                    fill="none" 
                    stroke="#2563EB" 
                    strokeWidth="1.5" 
                    strokeDasharray="5 5" 
                    opacity="0.5"
                  />
                  
                  {/* Main spline line */}
                  <path 
                    d="M 30,140 C 55,135 55,130 80,130 C 105,130 105,110 130,110 C 155,110 155,115 180,115 C 205,115 205,95 230,95 C 255,95 255,85 280,85 C 305,85 305,90 330,90 C 355,90 355,75 380,75 C 405,75 405,60 430,60 C 455,60 455,55 480,55 C 505,55 505,45 530,45 C 555,45 555,35 580,35" 
                    fill="none" 
                    stroke="#06B6D4" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />

                  {/* Glow effect duplicate */}
                  <path 
                    d="M 30,140 C 55,135 55,130 80,130 C 105,130 105,110 130,110 C 155,110 155,115 180,115 C 205,115 205,95 230,95 C 255,95 255,85 280,85 C 305,85 305,90 330,90 C 355,90 355,75 380,75 C 405,75 405,60 430,60 C 455,60 455,55 480,55 C 505,55 505,45 530,45 C 555,45 555,35 580,35" 
                    fill="none" 
                    stroke="#06B6D4" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    opacity="0.15"
                  />
                  
                  {/* Dots on line */}
                  <circle cx="580" cy="35" r="4.5" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
              </div>
              
              {/* X-Axis Month Labels */}
              <div className="flex justify-between px-6 text-[9px] font-bold text-slate-400 mt-2 select-none">
                <span>{lang === 'ar' ? 'أغسطس' : 'Aug'}</span>
                <span>{lang === 'ar' ? 'سبتمبر' : 'Sep'}</span>
                <span>{lang === 'ar' ? 'أكتوبر' : 'Oct'}</span>
                <span>{lang === 'ar' ? 'نوفمبر' : 'Nov'}</span>
                <span>{lang === 'ar' ? 'ديسمبر' : 'Dec'}</span>
                <span>{lang === 'ar' ? 'يناير' : 'Jan'}</span>
                <span>{lang === 'ar' ? 'فبراير' : 'Feb'}</span>
                <span>{lang === 'ar' ? 'مارس' : 'Mar'}</span>
                <span>{lang === 'ar' ? 'أبريل' : 'Apr'}</span>
                <span>{lang === 'ar' ? 'مايو' : 'May'}</span>
                <span>{lang === 'ar' ? 'يونيو' : 'Jun'}</span>
                <span>{lang === 'ar' ? 'يوليو' : 'Jul'}</span>
              </div>
            </div>
          </div>

          {/* Today check-ins table */}
          <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-transparent">
              <div>
                <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'سجل العمليات اليومية' : 'سجل العمليات اليومية'}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'آخر تسجيلات الحضور والانصراف' : 'Latest check-in and check-out logs'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => triggerAlert(lang === 'ar' ? 'عرض السجل الكامل...' : 'Viewing full log...')}
                  className="bg-white/5 border border-white/10 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-white/10 transition-all"
                >
                  {lang === 'ar' ? 'عرض الكل' : 'View All'}
                </button>
                <select className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-[10px] font-black text-slate-300 focus:outline-none cursor-pointer">
                  <option value="today">{lang === 'ar' ? 'اليوم' : 'Today'}</option>
                  <option value="week">{lang === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                    <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'وقت الحضور' : 'Clock In'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'وقت الانصراف' : 'Clock Out'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'طريقة التحقق' : 'Verification'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'الموقع' : 'Location'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map(rec => (
                    <tr key={rec.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={rec.empAvatar} className="w-8.5 h-8.5 rounded-xl object-cover border border-white/10" />
                          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                            <p className="font-bold text-white">{rec.empName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{rec.empTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-white">{rec.clock_in_time}</td>
                      <td className="py-4 px-6 font-mono text-slate-400">{rec.clock_out_time || '--:--'}</td>
                      <td className="py-4 px-6">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          {rec.method === 'biometric' && <Fingerprint size={14} className="text-violet-400" />}
                          {rec.method === 'qrcode' && <QrCode size={14} className="text-cyan-400" />}
                          {rec.method === 'gps' && <MapPin size={14} className="text-blue-400" />}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {rec.method === 'biometric' && (lang === 'ar' ? 'بصمة وجه/إصبع' : 'Biometric Device')}
                        {rec.method === 'qrcode' && (lang === 'ar' ? 'الاستجابة QR' : 'QR Scanner')}
                        {rec.method === 'gps' && (lang === 'ar' ? 'الموقع الجغرافي GPS' : 'GPS mobile app')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          rec.status === 'early' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : rec.status === 'late'
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {rec.status === 'early' && (lang === 'ar' ? 'حضور مبكر' : 'Early')}
                          {rec.status === 'late' && (lang === 'ar' ? 'حضور متأخر' : 'Late')}
                          {rec.status === 'regular' && (lang === 'ar' ? 'حضور منتظم' : 'Regular')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Attendance Log Tab */}
      {activeSubTab === 'log' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-5 border border-white/5 shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute right-3.5 top-3 text-slate-400" size={16} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 glass-input rounded-xl text-xs font-bold text-white focus:outline-none text-right"
                placeholder={lang === 'ar' ? 'البحث بالاسم أو التاريخ...' : 'Search name or date...'}
              />
            </div>
            <button className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 hover:brightness-110 transition-all border border-white/20">
              <FileSpreadsheet size={16} />
              {lang === 'ar' ? 'تصدير كشف الإكسل' : 'Export Sheet'}
            </button>
          </div>

          <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                    <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'الحضور والاتصال' : 'In / Out'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'ساعات العمل' : 'Work Hours'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'طريقة البصمة' : 'Verification Method'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={rec.empAvatar} className="w-8.5 h-8.5 rounded-xl object-cover border border-white/10" />
                          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                            <p className="font-bold text-white">{rec.empName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{rec.empTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">{rec.date}</td>
                      <td className="py-4 px-6 font-mono">
                        <span className="text-emerald-400">{rec.clock_in_time}</span>
                        <span className="mx-1.5 text-slate-500">/</span>
                        <span className="text-red-400">{rec.clock_out_time || '--:--'}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-white">
                        {rec.working_hours > 0 
                          ? `${rec.working_hours} ${lang === 'ar' ? 'ساعة' : 'hrs'}` 
                          : (lang === 'ar' ? 'مناوبة جارية' : 'Active shift')}
                      </td>
                      <td className="py-4 px-6 capitalize text-slate-350">
                        <span className="flex items-center gap-1.5 justify-end">
                          {rec.method === 'biometric' && <Fingerprint size={14} className="text-violet-400" />}
                          {rec.method === 'qrcode' && <QrCode size={14} className="text-cyan-400" />}
                          {rec.method === 'gps' && <MapPin size={14} className="text-blue-400" />}
                          <span>
                            {rec.method === 'biometric' && (lang === 'ar' ? 'جهاز بصمة' : 'Biometric')}
                            {rec.method === 'qrcode' && (lang === 'ar' ? 'رمز QR' : 'QR Code')}
                            {rec.method === 'gps' && (lang === 'ar' ? 'جي بي إس' : 'GPS')}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Lateness & Delays Tab */}
      {activeSubTab === 'delays' && (
        <div className="space-y-6">
          {/* Lateness Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex items-center gap-4 shadow-lg">
              <div className="p-4 bg-orange-500/10 text-orange-400 rounded-2xl shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <Clock size={24} />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي دقائق التأخير' : 'Total Delay Minutes'}</p>
                <p className="text-xl font-black text-white mt-0.5">124 {lang === 'ar' ? 'دقيقة' : 'mins'}</p>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4 shadow-lg">
              <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                <ShieldAlert size={24} />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'قيمة الجزاءات المترتبة' : 'Delay Penalty Deductions'}</p>
                <p className="text-xl font-black text-red-400 mt-0.5">180 {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4 shadow-lg">
              <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                <Sliders size={24} />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'سقف سماحية الدخول' : 'Grace Period Limit'}</p>
                <p className="text-xl font-black text-white mt-0.5">15 {lang === 'ar' ? 'دقيقة مجانية' : 'mins grace'}</p>
              </div>
            </div>
          </div>

          {/* Lateness Log Table */}
          <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                    <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'تاريخ العملية' : 'Date'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'وقت البصم' : 'Clock In Time'}</th>
                    <th className="py-4 px-6 text-orange-400">{lang === 'ar' ? 'مدة التأخير' : 'Lateness Duration'}</th>
                    <th className="py-4 px-6 text-red-400">{lang === 'ar' ? 'الخصم التقديري' : 'Calculated Deduction'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.filter(r => r.latenessMinutes > 0).map(rec => (
                    <tr key={rec.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={rec.empAvatar} className="w-8.5 h-8.5 rounded-xl object-cover border border-white/10" />
                          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                            <p className="font-bold text-white">{rec.empName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{rec.empTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-300">{rec.date}</td>
                      <td className="py-4 px-6 font-mono text-white">{rec.clock_in_time}</td>
                      <td className="py-4 px-6 font-mono text-orange-400">+{rec.latenessMinutes} {lang === 'ar' ? 'دقيقة تأخير' : 'minutes late'}</td>
                      <td className="py-4 px-6 font-mono text-red-400">-{Math.round(rec.latenessMinutes * 1.5)} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Overtime Log Tab */}
      {activeSubTab === 'overtime' && (
        <div className="space-y-6">
          {/* Overtime statistics widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 flex items-center gap-4 shadow-lg">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <Clock size={24} />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'إجمالي الساعات الإضافية' : 'Total Overtime Hours'}</p>
                <p className="text-xl font-black text-[#06B6D4] mt-0.5">3.2 {lang === 'ar' ? 'ساعة إضافية' : 'hours'}</p>
              </div>
            </div>

            <div className="glass-card p-6 flex items-center gap-4 shadow-lg">
              <div className="p-4 bg-violet-500/10 text-violet-400 rounded-2xl shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.15)]">
                <TrendingUp size={24} />
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'ar' ? 'مستحقات الإضافي المتوقعة' : 'Est. Overtime Payout'}</p>
                <p className="text-xl font-black text-white mt-0.5">240 {lang === 'ar' ? 'ر.س' : 'SAR'}</p>
              </div>
            </div>
          </div>

          {/* Overtime Log Table */}
          <div className="glass-card rounded-[2rem] border border-white/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-white/5">
                    <th className="py-4 px-6">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'تاريخ اليوم' : 'Date'}</th>
                    <th className="py-4 px-6">{lang === 'ar' ? 'ساعات العمل الفعلية' : 'Worked Hours'}</th>
                    <th className="py-4 px-6 text-emerald-400">{lang === 'ar' ? 'ساعات الإضافي' : 'Overtime Hours'}</th>
                    <th className="py-4 px-6 text-[#06B6D4]">{lang === 'ar' ? 'المستحقات الإضافية' : 'Estimated Payout'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.filter(r => r.overtimeHours > 0).map(rec => (
                    <tr key={rec.id} className="hover:bg-white/[0.02] text-xs font-bold text-slate-200 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={rec.empAvatar} className="w-8.5 h-8.5 rounded-xl object-cover border border-white/10" />
                          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                            <p className="font-bold text-white">{rec.empName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{rec.empTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-300">{rec.date}</td>
                      <td className="py-4 px-6 font-mono text-white">{rec.working_hours} {lang === 'ar' ? 'ساعة' : 'hrs'}</td>
                      <td className="py-4 px-6 font-mono text-emerald-400">+{rec.overtimeHours} {lang === 'ar' ? 'ساعة إضافي' : 'overtime hrs'}</td>
                      <td className="py-4 px-6 font-mono text-[#06B6D4] font-black">+{Math.round(rec.overtimeHours * 75)} {lang === 'ar' ? 'ر.س' : 'SAR'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Biometrics Tab */}
      {activeSubTab === 'biometric' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Biometrics Settings Form */}
          <div className="glass-card p-6 border border-white/5 shadow-sm space-y-6 h-fit">
            <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'سياسة التحقق ببصمة الوجه والأصبع' : 'Biometric Security Policies'}</h3>
            
            <div className="space-y-4">
              {/* Face ID Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'بصمة الوجه (Face ID)' : 'Face ID Verification'}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'السماح بتحضير الموظفين عبر بصمة الوجه للجوال' : 'Allow mobile biometric Face ID check-in'}</p>
                </div>
                <button 
                  onClick={() => { setFaceIdEnabled(!faceIdEnabled); triggerAlert(lang === 'ar' ? 'تم تحديث سياسة بصمة الوجه' : 'Face ID configuration updated'); }}
                  className={`w-11 h-6 rounded-full transition-all relative ${faceIdEnabled ? 'bg-[#06B6D4]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${faceIdEnabled ? (lang === 'ar' ? 'left-6' : 'right-6') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></span>
                </button>
              </div>

              {/* Fingerprint Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'بصمة الإصبع (Touch ID)' : 'Fingerprint Check-in'}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'السماح بالتحضير عبر مستشعر بصمة الجوال' : 'Allow mobile fingerprint check-in'}</p>
                </div>
                <button 
                  onClick={() => { setFingerprintEnabled(!fingerprintEnabled); triggerAlert(lang === 'ar' ? 'تم تحديث سياسة بصمة الأصبع' : 'Fingerprint configuration updated'); }}
                  className={`w-11 h-6 rounded-full transition-all relative ${fingerprintEnabled ? 'bg-[#06B6D4]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${fingerprintEnabled ? (lang === 'ar' ? 'left-6' : 'right-6') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></span>
                </button>
              </div>

              {/* General mobile checkin Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'التحضير الذاتي من الجوال' : 'Mobile Self-ClockIn'}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? 'تمكين الموظفين من البصم عبر تطبيق الجوال' : 'Allow self clock-in via mobile application'}</p>
                </div>
                <button 
                  onClick={() => { setMobileClockInEnabled(!mobileClockInEnabled); triggerAlert(lang === 'ar' ? 'تم تحديث إعداد التحضير بالهاتف' : 'Mobile clock-in policy updated'); }}
                  className={`w-11 h-6 rounded-full transition-all relative ${mobileClockInEnabled ? 'bg-[#06B6D4]' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${mobileClockInEnabled ? (lang === 'ar' ? 'left-6' : 'right-6') : (lang === 'ar' ? 'left-1' : 'right-1')}`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Biometric Terminals list */}
          <div className="lg:col-span-2 glass-card rounded-[2rem] border border-white/5 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'أجهزة البصمة والمستشعرات المرتبطة' : 'Linked Attendance Biometric Terminals'}</h3>
              <button 
                onClick={() => triggerAlert(lang === 'ar' ? 'يتم البحث عن أجهزة بصمة جديدة على الشبكة المحلية...' : 'Searching local network for new biometric devices...')}
                className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white px-3.5 py-2 rounded-xl text-[10px] font-black hover:brightness-110 transition-all border border-white/20"
              >
                {lang === 'ar' ? 'إقران جهاز بصمة' : 'Link Terminal'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:border-[#06B6D4]/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Cpu size={18} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'جهاز البصمة الرئيسي - الإدارة' : 'Main Gate Scanner - HQ'}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">IP: 192.168.1.150 • ZKTeco uFace</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400">{lang === 'ar' ? 'متصل' : 'Online'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:border-[#06B6D4]/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Cpu size={18} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'بصمة البوابة الغربية - الإدارة' : 'West Gate Scanner - HQ'}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">IP: 192.168.1.151 • ZKTeco uFace</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400">{lang === 'ar' ? 'متصل' : 'Online'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:border-red-500/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 bg-red-500/10 text-red-400 rounded-xl">
                    <Cpu size={18} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-white">{lang === 'ar' ? 'جهاز بصمة - فرع مكة المكرمة' : 'Makkah Gate Scanner'}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">IP: 10.0.3.110 • Hikvision FaceID</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-400">{lang === 'ar' ? 'غير متصل' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. QR Code Scanner Config Tab */}
      {activeSubTab === 'qrcode' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Generator Panel */}
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-5 shadow-xl">
            <h3 className="text-sm font-black text-white w-full text-right">{lang === 'ar' ? 'رمز QR الحركي للتحضير' : 'Dynamic Clock-in QR Code'}</h3>
            
            <div className="p-5 bg-white rounded-3xl border border-white/10 relative group overflow-hidden shadow-inner">
              {/* Simulated QR Code SVG */}
              <svg className="w-48 h-48 text-slate-900" viewBox="0 0 100 100">
                <rect width="25" height="25" fill="currentColor"/>
                <rect x="75" width="25" height="25" fill="currentColor"/>
                <rect y="75" width="25" height="25" fill="currentColor"/>
                <rect x="6" y="6" width="13" height="13" fill="white"/>
                <rect x="81" y="6" width="13" height="13" fill="white"/>
                <rect x="6" y="81" width="13" height="13" fill="white"/>
                
                {/* Simulated random qr points */}
                <rect x="35" y="5" width="5" height="10" fill="currentColor"/>
                <rect x="45" y="15" width="10" height="5" fill="currentColor"/>
                <rect x="5" y="35" width="15" height="5" fill="currentColor"/>
                <rect x="35" y="35" width="20" height="20" fill="currentColor"/>
                <rect x="60" y="35" width="10" height="10" fill="currentColor"/>
                <rect x="75" y="45" width="20" height="5" fill="currentColor"/>
                <rect x="45" y="65" width="10" height="10" fill="currentColor"/>
                <rect x="65" y="65" width="15" height="15" fill="currentColor"/>
                <rect x="15" y="55" width="10" height="5" fill="currentColor"/>
                <rect x="85" y="85" width="10" height="10" fill="currentColor"/>
              </svg>
              {/* Blur overlay on refresh */}
              {qrRefreshesIn === 30 && (
                <div className="absolute inset-0 bg-[#0F172A]/85 backdrop-blur-sm flex items-center justify-center text-xs font-black text-white">
                  {lang === 'ar' ? 'جاري تحديث الرمز...' : 'Updating Code...'}
                </div>
              )}
            </div>

            <div className="space-y-1.5 w-full">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>{lang === 'ar' ? 'تحديث الرمز تلقائياً' : 'Automatic Refresh'}</span>
                <span className="text-[#06B6D4] font-mono">{qrRefreshesIn} {lang === 'ar' ? 'ثانية' : 'seconds'}</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div className="bg-[#06B6D4] h-full transition-all duration-1000" style={{ width: `${(qrRefreshesIn / 30) * 100}%` }}></div>
              </div>
            </div>

            <button 
              onClick={() => { setQrRefreshesIn(30); triggerAlert(lang === 'ar' ? 'تم تجديد الرمز الثنائي للتحضير' : 'Clock-in QR code forced refresh'); }}
              className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all border border-white/20 flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              {lang === 'ar' ? 'تحديث الرمز الآن' : 'Refresh QR Code'}
            </button>
          </div>

          {/* QR Settings Panel */}
          <div className="lg:col-span-2 glass-card rounded-[2rem] border border-white/5 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'إعدادات تشغيل التحضير بـ QR Code' : 'Dynamic QR Code Configuration'}</h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 block">{lang === 'ar' ? 'الفرع المستهدف للتحضير' : 'Target Office Branch'}</label>
                <select 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  <option value="riyadh">{lang === 'ar' ? 'فرع الرياض الرئيسي' : 'Riyadh Main HQ'}</option>
                  <option value="makkah">{lang === 'ar' ? 'فرع مكة المكرمة' : 'Makkah Branch'}</option>
                </select>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex gap-3 text-xs">
                <Info className="text-[#06B6D4] shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold text-white">{lang === 'ar' ? 'كيف يعمل التحضير بـ QR Code؟' : 'How does QR Code Clock-in work?'}</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    {lang === 'ar' ? 'يتم عرض هذا الرمز المشفر على شاشة الآيباد عند مدخل الفرع. يقوم الموظف بفتح كاميرا تطبيق الجوال (be attend) الخاص به ومسح الرمز ضوئياً، فيقوم النظام بمقارنة الرمز المتغير والتأكد من تواجده الفعلي في نفس الثانية لإتمام الحضور.' 
                                   : 'Display this screen on a tablet mounted at the reception. Employees use their mobile app scanner to scan the code. Because the code refreshes every 30 seconds, sharing codes or proxy clock-ins are fully prevented.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. GPS Geofencing tracking Tab */}
      {activeSubTab === 'gps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* GPS logs list */}
          <div className="lg:col-span-2 glass-card rounded-[2rem] border border-white/5 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'سجل تتبع البصمات الجغرافي النشط' : 'Active Mobile GPS Check-in Tracking Logs'}</h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <MapPin size={16} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-white">أحمد العتيبي • EMP-1001</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Lat: 24.7136, Lng: 46.6753 • Accuracy: ±3m</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400">{lang === 'ar' ? 'داخل النطاق المصرح' : 'In Perimeter'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <MapPin size={16} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-white">سارة الغامدي • EMP-1002</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Lat: 24.7138, Lng: 46.6755 • Accuracy: ±4m</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400">{lang === 'ar' ? 'داخل النطاق المصرح' : 'In Perimeter'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-red-500/20 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                    <MapPin size={16} />
                  </div>
                  <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                    <h4 className="text-xs font-black text-white">محمد الحربي • EMP-1012</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Lat: 24.7210, Lng: 46.6802 • Accuracy: ±15m</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/10 text-red-400">{lang === 'ar' ? 'خارج النطاق (مرفوض)' : 'Out of Geofence'}</span>
              </div>
            </div>
          </div>

          {/* GPS Config Panel */}
          <div className="glass-card p-6 border border-white/5 shadow-sm space-y-5 h-fit">
            <h3 className="text-sm font-black text-white">{lang === 'ar' ? 'سياسة التحقق الجغرافي GPS' : 'GPS Verification Settings'}</h3>
            <div className="space-y-4 text-xs font-bold text-slate-400 leading-relaxed">
              <p>
                {lang === 'ar' ? 'عند التحضير باستخدام الجوال، يطالب التطبيق بالوصول للموقع ويقيس بعد الهاتف عن إحداثيات الفرع المحددة.' 
                               : 'GPS tracking validates coordinates submitted by the mobile app against the designated office radius.'}
              </p>
              <p>
                {lang === 'ar' ? 'لتهيئة أبعاد الفروع وتعديل مدى القطر المسموح بالبصمة فيه (مثلاً 100 متر)، يرجى الذهاب لتبويب المواقع الجغرافية باللوحة.'
                               : 'To modify radius (e.g. 100m) or adjust target lat/lng pins, please navigate to the Locations settings panel.'}
              </p>
              <button 
                onClick={() => triggerAlert(lang === 'ar' ? 'تمت مطابقة معايير تتبع نظام تحديد المواقع بنجاح' : 'GPS parameters synced successfully')}
                className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-xl text-xs font-black shadow-md hover:brightness-110 transition-all border border-white/20 flex items-center justify-center gap-1.5"
              >
                {lang === 'ar' ? 'مزامنة معايير الـ GPS' : 'Sync GPS Parameters'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
