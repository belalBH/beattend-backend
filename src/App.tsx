import React, { useState, useEffect } from "react";

export default function App() {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '').trim();
    const savedPage = localStorage.getItem('beattend_active_page') || '';
    const validTabs = ['dashboard', 'employees', 'attendance', 'leaves', 'locations', 'reports', 'settings'];
    if (validTabs.includes(hash)) return hash;
    if (validTabs.includes(savedPage)) return savedPage;
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.location.hash = tab;
    localStorage.setItem('beattend_active_page', tab);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const validTabs = ['dashboard', 'employees', 'attendance', 'leaves', 'locations', 'reports', 'settings'];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
        localStorage.setItem('beattend_active_page', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const employeesData = [
    {
      id: 1,
      empNo: "EMP-001",
      name: "بلال البنا",
      email: "b.albanna@hadiyah.org.sa",
      company: "جمعية هدية (Hadiyah Association)",
      location: "Fayha Branch",
      dept: "تقنية المعلومات (IT)",
      status: "active",
      mobileApp: true
    },
    {
      id: 2,
      empNo: "EMP-101",
      name: "سعد العتيبي",
      email: "saad@solutions.sa",
      company: "Solutions Co",
      location: "Al Naseem - HQ",
      dept: "تقنية المعلومات (IT)",
      status: "active",
      mobileApp: true
    },
    {
      id: 3,
      empNo: "EMP-102",
      name: "خالد الشهري",
      email: "k.shehri@solutions.sa",
      company: "Solutions Co",
      location: "Al Naseem - HQ",
      dept: "الموارد البشرية (HR)",
      status: "active",
      mobileApp: false
    }
  ];

  const attendanceData = [
    { id: 1, name: "بلال البنا", timeIn: "08:00 AM", timeOut: "04:30 PM", location: "Fayha Branch", workHours: "8.5 س", status: "حاضر في الموعد" },
    { id: 2, name: "سعد العتيبي", timeIn: "08:15 AM", timeOut: "04:30 PM", location: "Al Naseem - HQ", workHours: "8.25 س", status: "متأخر 15 دقيقة" },
    { id: 3, name: "خالد الشهري", timeIn: "-", timeOut: "-", location: "Al Naseem - HQ", workHours: "0 س", status: "غائب" }
  ];

  const leavesData = [
    { id: 1, name: "بلال البنا", type: "إجازة سنوية", startDate: "2026-08-05", endDate: "2026-08-10", days: 5, balance: "18 يوم", status: "بانتظار موافقة المدير" },
    { id: 2, name: "سعد العتيبي", type: "إجازة مرضية", startDate: "2026-07-20", endDate: "2026-07-21", days: 2, balance: "12 يوم", status: "مقبولة" }
  ];

  const filteredEmployees = employeesData.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f0f3f6] text-[#1e293b] font-sans" dir="rtl">
      
      {/* 1. RIGHT DARK SIDEBAR (RTL NAVIGATION) */}
      <aside className="w-[260px] bg-[#1e262c] text-[#bdc6ce] flex-shrink-0 flex flex-col min-h-screen shadow-xl border-l border-white/5">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl font-black">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8force-z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg leading-tight m-0">BeatAttend</h1>
            <span className="bg-sky-400/20 text-sky-400 border border-sky-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">HR ENTERPRISE</span>
          </div>
        </div>

        {/* User Profile Header */}
        <div className="p-5 text-center border-b border-white/5">
          <div className="relative inline-block mb-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              alt="المدير العام"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mx-auto"
            />
          </div>
          <h2 className="text-white font-bold text-sm m-0">المدير العام</h2>
          <p className="text-[#788793] text-xs mt-0.5 font-medium">مسؤول النظام المعتمد</p>
        </div>

        {/* Navigation List */}
        <nav className="py-3 flex-1">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-all border-r-4 ${
                  activeTab === "dashboard"
                    ? "bg-[#2c3842] text-white border-sky-400"
                    : "hover:bg-[#29333b] text-[#bdc6ce] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 13h6a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1zm0 8h6a1 1 0 001-1v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1zm10 0h6a1 1 0 001-1v-8a1 1 0 00-1-1h-6a1 1 0 00-1 1v8a1 1 0 001 1zm0-18v4a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1h-6a1 1 0 00-1 1z"/>
                  </svg>
                  <span>الرئيسية (لوحة المعلومات)</span>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab("employees")}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-all border-r-4 ${
                  activeTab === "employees"
                    ? "bg-[#2c3842] text-white border-sky-400"
                    : "hover:bg-[#29333b] text-[#bdc6ce] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  <span>إدارة الموظفين</span>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-all border-r-4 ${
                  activeTab === "attendance"
                    ? "bg-[#2c3842] text-white border-sky-400"
                    : "hover:bg-[#29333b] text-[#bdc6ce] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                  </svg>
                  <span>سجلات الحضور والغياب</span>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab("leaves")}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-all border-r-4 ${
                  activeTab === "leaves"
                    ? "bg-[#2c3842] text-white border-sky-400"
                    : "hover:bg-[#29333b] text-[#bdc6ce] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z"/>
                  </svg>
                  <span>طلبات الإجازات</span>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab("locations")}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-all border-r-4 ${
                  activeTab === "locations"
                    ? "bg-[#2c3842] text-white border-sky-400"
                    : "hover:bg-[#29333b] text-[#bdc6ce] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>المواقع الجغرافية</span>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab("reports")}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-all border-r-4 ${
                  activeTab === "reports"
                    ? "bg-[#2c3842] text-white border-sky-400"
                    : "hover:bg-[#29333b] text-[#bdc6ce] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  <span>التقارير المعتمدة</span>
                </div>
              </button>
            </li>

            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-all border-r-4 ${
                  activeTab === "settings"
                    ? "bg-[#2c3842] text-white border-sky-400"
                    : "hover:bg-[#29333b] text-[#bdc6ce] border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                  </svg>
                  <span>إعدادات النظام</span>
                </div>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA (LEFT SIDE IN RTL) */}
      <main className="flex-1 p-7 overflow-y-auto">
        
        {/* Top 4 Horizontal Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Card 1: Present */}
          <div className="bg-white rounded-lg p-5 flex items-center justify-between border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-500 mb-1">الحضور اليوم</div>
              <div className="text-2xl font-extrabold text-slate-900 leading-tight">45</div>
            </div>
          </div>

          {/* Card 2: Absent */}
          <div className="bg-white rounded-lg p-5 flex items-center justify-between border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-500 mb-1">الغياب اليوم</div>
              <div className="text-2xl font-extrabold text-slate-900 leading-tight">5</div>
            </div>
          </div>

          {/* Card 3: Late */}
          <div className="bg-white rounded-lg p-5 flex items-center justify-between border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-500 mb-1">التأخير اليوم</div>
              <div className="text-2xl font-extrabold text-slate-900 leading-tight">3</div>
            </div>
          </div>

          {/* Card 4: Total Staff */}
          <div className="bg-white rounded-lg p-5 flex items-center justify-between border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-500 mb-1">إجمالي الموظفين</div>
              <div className="text-2xl font-extrabold text-slate-900 leading-tight">50</div>
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC CONTAINER CARDS SWITCHED BY ACTIVE TAB */}
        
        {/* VIEW 1: EMPLOYEES DIRECTORY (activeTab === 'employees') */}
        {activeTab === "employees" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
              <h2 className="text-xl font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                سجل إدارة الموظفين والحسابات المعتمدة
              </h2>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="بحث باسم الموظف أو البريد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-9 pl-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button className="bg-[#1e262c] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#29333b] transition-all shadow-sm">
                  + إضافة موظف جديد
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#eef2f5] text-slate-700 text-xs font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-3.5 px-4">رقم الموظف</th>
                    <th className="py-3.5 px-4">الاسم الكامل</th>
                    <th className="py-3.5 px-4">البريد الإلكتروني</th>
                    <th className="py-3.5 px-4">الشركة المنتسب لها</th>
                    <th className="py-3.5 px-4">القسم وموقع العمل</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-blue-600">{emp.empNo}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-4 px-4 text-slate-500">{emp.email}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded text-xs font-bold">
                          {emp.company}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800">{emp.dept}</span>{" "}
                        <span className="text-slate-400 text-xs">({emp.location})</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1">
                          ✓ نشط (الجوال مفعل)
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="bg-white border border-slate-300 text-slate-700 px-3 py-1 rounded text-xs font-bold hover:bg-slate-50 transition-colors">
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: ATTENDANCE LOGS (activeTab === 'attendance' or 'dashboard') */}
        {(activeTab === "attendance" || activeTab === "dashboard") && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
              <h2 className="text-xl font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                سجل الحضور المباشر والتأخير التفصيلي
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#eef2f5] text-slate-700 text-xs font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-3.5 px-4">الموظف</th>
                    <th className="py-3.5 px-4">وقت الحضور</th>
                    <th className="py-3.5 px-4">وقت الانصراف</th>
                    <th className="py-3.5 px-4">الموقع الجغرافي</th>
                    <th className="py-3.5 px-4">ساعات العمل</th>
                    <th className="py-3.5 px-4">الحالة الرسمية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {attendanceData.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">{att.name}</td>
                      <td className="py-4 px-4 text-emerald-700 font-mono font-bold">{att.timeIn}</td>
                      <td className="py-4 px-4 text-slate-600 font-mono">{att.timeOut}</td>
                      <td className="py-4 px-4 text-slate-700">{att.location}</td>
                      <td className="py-4 px-4 font-bold">{att.workHours}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          att.status.includes('حاضر') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          att.status.includes('متأخر') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: LEAVE REQUESTS (activeTab === 'leaves') */}
        {activeTab === "leaves" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                طلبات ورصيد الإجازات المعلقة
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#eef2f5] text-slate-700 text-xs font-bold uppercase tracking-wider border-y border-slate-200">
                    <th className="py-3.5 px-4">الموظف</th>
                    <th className="py-3.5 px-4">نوع الإجازة</th>
                    <th className="py-3.5 px-4">من تاريخ</th>
                    <th className="py-3.5 px-4">إلى تاريخ</th>
                    <th className="py-3.5 px-4">الأيام</th>
                    <th className="py-3.5 px-4">الرصيد المتبقي</th>
                    <th className="py-3.5 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {leavesData.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">{leave.name}</td>
                      <td className="py-4 px-4 text-blue-700 font-semibold">{leave.type}</td>
                      <td className="py-4 px-4 text-slate-600">{leave.startDate}</td>
                      <td className="py-4 px-4 text-slate-600">{leave.endDate}</td>
                      <td className="py-4 px-4 font-bold">{leave.days} أيام</td>
                      <td className="py-4 px-4 text-emerald-700 font-bold">{leave.balance}</td>
                      <td className="py-4 px-4">
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded text-xs font-bold">
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: LOCATIONS (activeTab === 'locations') */}
        {activeTab === "locations" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              المواقع الجغرافية ونطاق الحضور الجغرافي (Geofence Zones)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="font-bold text-slate-900 text-lg">Al Naseem - HQ</h3>
                <p className="text-xs text-slate-500 mt-1">الإحداثيات: 24.7136° N, 46.6753° E</p>
                <p className="text-xs text-emerald-700 font-bold mt-2">نطاق البصمة المسموح: 200 متر</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="font-bold text-slate-900 text-lg">Fayha Branch - فرع الفيحاء</h3>
                <p className="text-xs text-slate-500 mt-1">الإحداثيات: 24.6892° N, 46.7321° E</p>
                <p className="text-xs text-emerald-700 font-bold mt-2">نطاق البصمة المسموح: 150 متر</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: REPORTS (activeTab === 'reports') */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              مركز التقارير المعتمدة وتصدير مسيرات الرواتب
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 border border-slate-200 rounded-lg text-center bg-slate-50">
                <div className="text-emerald-600 font-black text-2xl mb-1">EXCEL</div>
                <h3 className="font-bold text-slate-900">تقرير الحضور الشهري</h3>
                <button className="mt-3 bg-[#1e262c] text-white text-xs px-4 py-2 rounded font-bold">تصدير التقرير</button>
              </div>
              <div className="p-5 border border-slate-200 rounded-lg text-center bg-slate-50">
                <div className="text-rose-600 font-black text-2xl mb-1">PDF</div>
                <h3 className="font-bold text-slate-900">تقرير الإجازات والأرصدة</h3>
                <button className="mt-3 bg-[#1e262c] text-white text-xs px-4 py-2 rounded font-bold">تصدير التقرير</button>
              </div>
              <div className="p-5 border border-slate-200 rounded-lg text-center bg-slate-50">
                <div className="text-blue-600 font-black text-2xl mb-1">CSV</div>
                <h3 className="font-bold text-slate-900">تقرير التأخير والخروج المبكر</h3>
                <button className="mt-3 bg-[#1e262c] text-white text-xs px-4 py-2 rounded font-bold">تصدير التقرير</button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: SETTINGS (activeTab === 'settings') */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              إعدادات النظام والـ API
            </h2>
            <div className="p-4 border border-slate-200 rounded bg-slate-50">
              <label className="block text-xs font-bold text-slate-700 mb-2">رابط خادم الربط (API Base URL)</label>
              <input type="text" readOnly value="https://beattend.com/api" className="w-full p-2 border rounded bg-white text-sm text-slate-800 font-mono" />
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
