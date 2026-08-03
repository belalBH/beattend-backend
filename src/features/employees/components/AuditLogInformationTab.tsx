import React from 'react';

export const AuditLogInformationTab: React.FC = () => {
  return (
    <div className="space-y-4 text-right dir-rtl text-xs font-mono" dir="rtl">
      <h4 className="font-bold text-[#d4af37] font-sans">سجل التعديلات والعمليات النظامية (System Audit Trail):</h4>
      <div className="space-y-2">
        <div className="p-3 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl flex justify-between">
          <span className="text-slate-300">[2026-08-03 09:30:00] تحديث بيانات الموظف الأساسية بواسطة System Admin</span>
          <span className="text-emerald-400">SUCCESS</span>
        </div>
        <div className="p-3 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl flex justify-between">
          <span className="text-slate-300">[2026-08-02 18:20:00] تفعيل الموظف وتغيير حالة الحساب إلى Active</span>
          <span className="text-emerald-400">SUCCESS</span>
        </div>
      </div>
    </div>
  );
};
