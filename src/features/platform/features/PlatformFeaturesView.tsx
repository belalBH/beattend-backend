import React, { useState } from 'react';

export const PlatformFeaturesView: React.FC = () => {
  const modules = [
    { code: 'employees', nameAr: 'دليل الموظفين والهيكل التنظيمي', isCore: true, dep: 'لا يوجد (وحدة أساسية)' },
    { code: 'attendance', nameAr: 'الحضور والانصراف وتتبع البصمة', isCore: true, dep: 'لا يوجد' },
    { code: 'leaves', nameAr: 'إدارة الإجازات والطلبات الرسمية', isCore: true, dep: 'employees' },
    { code: 'shifts', nameAr: 'مناوبات العمل والوردية المتغيرة', isCore: false, dep: 'attendance' },
    { code: 'geofencing', nameAr: 'النطاق الجغرافي والخرائط المباشرة', isCore: false, dep: 'attendance' },
    { code: 'payroll', nameAr: 'مسيرات الرواتب ومستحقات الموظفين', isCore: false, dep: 'employees' },
    { code: 'documents', nameAr: 'إدارة المستندات والعقود الرسمية', isCore: false, dep: 'employees' },
    { code: 'reports', nameAr: 'التقارير والمؤشرات التفصيلية', isCore: false, dep: 'لا يوجد' },
    { code: 'roles_permissions', nameAr: 'إدارة الأدوار والصلاحيات RBAC', isCore: true, dep: 'لا يوجد' },
    { code: 'mobile_app', nameAr: 'تطبيق الجوال (crystal_hr)', isCore: true, dep: 'لا يوجد' },
    { code: 'api_access', nameAr: 'الربط البرمجي (API Access)', isCore: false, dep: 'لا يوجد' },
    { code: 'odoo_integration', nameAr: 'التكامل مع منصة أودو (Odoo ERP)', isCore: false, dep: 'payroll' },
    { code: 'mudad_integration', nameAr: 'التكامل مع نظام مدد (Mudad)', isCore: false, dep: 'payroll' }
  ];

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧩</span>
          <div>
            <h1 className="text-2xl font-black text-[#d4af37]">سجل الوحدات والاعتماديات (Feature Registry & Dependencies)</h1>
            <p className="text-xs text-slate-400 mt-1">إدارة وحدات SaaS المنظومة وتعريف الاعتماديات وتخصيص الربط التلقائي</p>
          </div>
        </div>
      </div>

      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">قائمة الموديولات وسلسلة الاعتماديات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-200">
            <thead className="bg-[#07120c] text-[#d4af37] border-b border-[#d4af37]/20">
              <tr>
                <th className="p-3">الكود</th>
                <th className="p-3">اسم الموديول</th>
                <th className="p-3">النوع</th>
                <th className="p-3">يعتمد على (Dependency)</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10">
              {modules.map((m) => (
                <tr key={m.code} className="hover:bg-[#182f22]">
                  <td className="p-3 font-mono text-[#d4af37]">{m.code}</td>
                  <td className="p-3 font-bold">{m.nameAr}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.isCore ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      {m.isCore ? 'أساسية' : 'إضافية'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400">{m.dep}</td>
                  <td className="p-3 text-emerald-400 font-bold">🟢 نشطة 100%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
