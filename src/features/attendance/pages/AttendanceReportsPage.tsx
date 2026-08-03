import React from 'react';

export const AttendanceReportsPage: React.FC = () => {
  const reports = [
    { title: 'تقرير الحضور والغياب اليومي الشامل', desc: 'إحصائيات تفصيلية بالحضور والتأخير لكافة الفروع', icon: '📊' },
    { title: 'تقرير التأخير والساعات الناقصة', desc: 'حساب دقائق وساعات التأخير مخصومة ومجمعة شهرياً', icon: '⏱️' },
    { title: 'تقرير الساعات الإضافية المعلمة (Overtime)', desc: 'قائمة بساعات الإضافي المعتمدة للمسير', icon: '💰' },
    { title: 'تقرير البصمات خارج النطاق الجغرافي', desc: 'كشف عمليات البصمة التي تمت خارج Geofence', icon: '📍' },
    { title: 'تقرير تصحيحات وتعديلات البصمة', desc: 'سجل الطلبات المعتمدة والمرفوضة لتصحيح الوقت', icon: '🛠️' },
    { title: 'تقرير الأجهزة المسجلة والموثوقة', desc: 'كشف بأجهزة الموظفين وUnique Device IDs', icon: '📱' }
  ];

  const handleExport = (type: string, title: string) => {
    alert(`جاري تصدير (${title}) بصيغة ${type} من خادم Staging...`);
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="bg-[#1b3325]/90 p-6 rounded-2xl border border-[#d4af37]/30 shadow-2xl">
        <h2 className="text-xl font-bold text-[#d4af37]">تقارير الحضور والانصراف الجاهزة والتصدير (Exportable Reports)</h2>
        <p className="text-xs text-slate-400 mt-1">تصدير الفلاتر والسجلات بصيغ Excel, PDF, CSV والطباعة المباشرة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((rep, idx) => (
          <div key={idx} className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{rep.icon}</span>
                <h3 className="text-base font-bold text-slate-100">{rep.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#d4af37]/10">
              <button
                type="button"
                onClick={() => handleExport('Excel', rep.title)}
                className="flex-1 py-1.5 bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition cursor-pointer"
              >
                📊 Excel
              </button>
              <button
                type="button"
                onClick={() => handleExport('PDF', rep.title)}
                className="flex-1 py-1.5 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition cursor-pointer"
              >
                📄 PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-1.5 px-3 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                🖨️ طباعة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
