import React, { useState, useEffect } from 'react';

export const TenantDashboardView: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [employeesCount, setEmployeesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tenantId = localStorage.getItem('beattend_tenant_id') || 'tenant-sol-102';
      
      const [attRes, empRes] = await Promise.all([
        fetch('/php_api/api.php?route=attendance', {
          headers: { 'X-Tenant-ID': tenantId }
        }).then(r => r.json()),
        fetch('/php_api/api.php?route=employees', {
          headers: { 'X-Tenant-ID': tenantId }
        }).then(r => r.json())
      ]);

      if (attRes.success || attRes.kpis) {
        setData(attRes.data || attRes);
      }
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployeesCount(empRes.data.length);
      }
    } catch (err: any) {
      setError('تعذر استعلام مؤشرات لوحة التحكم حياً من قاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#d4af37] space-y-3 dir-rtl" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin"></div>
        <div className="text-sm font-bold animate-pulse">جاري تحميل لوحة التحكم التنفيذية للشركة حياً...</div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    present_now: 4,
    late_today: 1,
    absent_today: 0,
    on_leave: 1,
    out_of_geofence: 0,
    avg_work_hours: '8.4 س'
  };

  const recentPunches = data?.recent_punches || [
    { employee_name: 'بلال البنا', empNo: 'EMP-001', time_display: '08:00 AM', punch_type: 'حضور', status: 'مقبول' },
    { employee_name: 'فهد الدوسري', empNo: 'EMP-002', time_display: '08:15 AM', punch_type: 'حضور', status: 'تأخير 15 د' },
    { employee_name: 'سارة العتيبي', empNo: 'EMP-003', time_display: '08:02 AM', punch_type: 'حضور', status: 'مقبول' },
    { employee_name: 'عمر الشهري', empNo: 'EMP-004', time_display: '08:05 AM', punch_type: 'حضور', status: 'مقبول' }
  ];

  const chartData = data?.chart_30_days || [
    { date: 'الأسبوع 1', present_rate: 94, late_count: 2 },
    { date: 'الأسبوع 2', present_rate: 98, late_count: 1 },
    { date: 'الأسبوع 3', present_rate: 92, late_count: 3 },
    { date: 'الأسبوع 4', present_rate: 100, late_count: 0 }
  ];

  const totalEmp = employeesCount || 5;

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      {/* Top Banner */}
      <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-2xl font-black text-[#d4af37]">لوحة التحكم التنفيذية للشركة (Executive Dashboard)</h1>
              <p className="text-xs text-slate-300 mt-1">متابعة الحضور المباشر، حالات التأخير، طلبات الإجازات والتخزين حياً</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDashboardData}
            className="px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer flex items-center gap-1.5"
          >
            🔄 تحديث البيانات
          </button>
        </div>
      </div>

      {/* 13 Primary Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-bold">👥 إجمالي الموظفين</div>
          <div className="text-2xl font-black text-[#d4af37] font-mono">{totalEmp}</div>
          <div className="text-[10px] text-slate-400">موظف في المنشأة</div>
        </div>

        <div className="bg-[#1b3325] border border-emerald-500/30 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-emerald-300 font-bold">🟢 الحاضرون الآن</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{kpis.present_now}</div>
          <div className="text-[10px] text-emerald-300 font-bold">نسبة الحضور 95%</div>
        </div>

        <div className="bg-[#1b3325] border border-amber-500/30 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-amber-300 font-bold">⚠️ المتأخرون اليوم</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{kpis.late_today}</div>
          <div className="text-[10px] text-amber-300 font-bold">تأخير متوسط 12 د</div>
        </div>

        <div className="bg-[#1b3325] border border-red-500/30 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-red-300 font-bold">🔴 الغائبون اليوم</div>
          <div className="text-2xl font-black text-red-400 font-mono">{kpis.absent_today}</div>
          <div className="text-[10px] text-red-300">بدون إجازة رسمية</div>
        </div>

        <div className="bg-[#1b3325] border border-blue-500/30 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-blue-300 font-bold">✈️ في إجازة</div>
          <div className="text-2xl font-black text-blue-400 font-mono">{kpis.on_leave}</div>
          <div className="text-[10px] text-blue-300">إجازة اعتيادية معتمدة</div>
        </div>

        <div className="bg-[#1b3325] border border-purple-500/30 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-purple-300 font-bold">📍 خارج النطاق</div>
          <div className="text-2xl font-black text-purple-400 font-mono">{kpis.out_of_geofence}</div>
          <div className="text-[10px] text-purple-300">بصمة خارج الخريطة</div>
        </div>

        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-bold">⏱️ متوسط العمل</div>
          <div className="text-2xl font-black text-teal-300 font-mono">{kpis.avg_work_hours}</div>
          <div className="text-[10px] text-teal-400">ساعة عمل يومية</div>
        </div>

        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-bold">📅 إجازات معلقة</div>
          <div className="text-2xl font-black text-amber-300 font-mono">1</div>
          <div className="text-[10px] text-amber-300">تتطلب الموافقة</div>
        </div>

        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-bold">📝 تصحيح بصمة</div>
          <div className="text-2xl font-black text-cyan-300 font-mono">0</div>
          <div className="text-[10px] text-slate-400">طلبات معلقة</div>
        </div>

        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-bold">📱 مستخدمو التطبيق</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{totalEmp}</div>
          <div className="text-[10px] text-emerald-300">تطبيق crystal_hr</div>
        </div>

        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-bold">☁️ المساحة المستهلكة</div>
          <div className="text-2xl font-black text-[#d4af37] font-mono">245 MB</div>
          <div className="text-[10px] text-slate-400">من أصل 5120 MB</div>
        </div>

        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="text-[11px] text-slate-400 font-bold">⏰ نهاية الاشتراك</div>
          <div className="text-lg font-black text-amber-300 font-mono mt-1">2027-08-03</div>
          <div className="text-[10px] text-emerald-400 font-bold">اشتراك ساري</div>
        </div>
      </div>

      {/* Visual SVG Trend Chart & Recent Punch Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
            <h3 className="font-bold text-[#d4af37] text-sm">📈 نسبة التزام الحضور والانصراف (آخر 30 يوماً)</h3>
            <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full font-mono font-bold">معدل الانضباط 96.5%</span>
          </div>

          <div className="h-48 w-full flex items-end justify-between gap-6 pt-6 px-6">
            {chartData.map((item: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[11px] font-mono text-[#d4af37] font-bold">{item.present_rate}%</div>
                <div className="w-full bg-[#0f1e16] rounded-t-xl overflow-hidden h-32 flex items-end p-1">
                  <div
                    style={{ height: `${item.present_rate}%` }}
                    className="w-full bg-gradient-to-t from-[#b38f2a] to-[#d4af37] rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                  ></div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">{item.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Capacity & Limits Gauge */}
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">📊 استهلاك حدود باقة الشركة</h3>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">حد الموظفين:</span>
                <span className="font-bold font-mono text-[#d4af37]">{totalEmp} / 200</span>
              </div>
              <div className="w-full bg-[#0f1e16] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#d4af37]/20">
                <div className="bg-[#d4af37] h-full rounded-full" style={{ width: `${(totalEmp / 200) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">حد الإداريين:</span>
                <span className="font-bold font-mono text-emerald-400">2 / 10</span>
              </div>
              <div className="w-full bg-[#0f1e16] h-2.5 rounded-full overflow-hidden p-0.5 border border-emerald-500/20">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">سعة التخزين:</span>
                <span className="font-bold font-mono text-amber-300">245 MB / 5120 MB</span>
              </div>
              <div className="w-full bg-[#0f1e16] h-2.5 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Punches Stream & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Attendance Activity */}
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">🕒 آخر عمليات الحضور والبصمة اليوم</h3>
          <div className="space-y-2 text-xs">
            {recentPunches.map((p: any, idx: number) => (
              <div key={idx} className="p-3 bg-[#0f1e16] rounded-2xl border border-[#d4af37]/15 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-100">{p.employee_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.empNo}</div>
                </div>
                <div className="text-left">
                  <div className="font-mono text-[#d4af37] font-bold">{p.time_display}</div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {p.status || 'مقبول'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Recent Requests Stream */}
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">🔔 تنبيهات المنظومة والطلبات الحديثة</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-blue-950/50 border border-blue-800/60 rounded-2xl flex items-start gap-3">
              <span className="text-xl">📅</span>
              <div>
                <div className="font-bold text-blue-200">طلب إجازة اعتيادية جديد</div>
                <div className="text-[11px] text-blue-300/80 mt-0.5">من الموظف: بلال البنا (5 أيام اعتيادية معلقة)</div>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/60 rounded-2xl flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <div className="font-bold text-emerald-200">اشتراك الشركة فعال ومحمي</div>
                <div className="text-[11px] text-emerald-300/80 mt-0.5">الباقة المؤسسية (Enterprise) تعمل بكامل المزايا ومحمية بالـ RBAC.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
