import React from 'react';

export const PayrollInformationTab: React.FC = () => {
  return (
    <div className="space-y-4 text-right dir-rtl" dir="rtl">
      <div className="p-6 bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl space-y-4">
        <h4 className="font-bold text-[#d4af37]">تفاصيل المسير الشهري وقسائم الرواتب:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
          <div className="p-3 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl">
            <span className="text-xs text-slate-400 font-sans">الراتب الأساسي:</span>
            <p className="font-bold text-emerald-400 mt-1">12,500.00 SAR</p>
          </div>
          <div className="p-3 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl">
            <span className="text-xs text-slate-400 font-sans">بدل السكن والمواصلات:</span>
            <p className="font-bold text-[#d4af37] mt-1">3,500.00 SAR</p>
          </div>
          <div className="p-3 bg-[#0f1e16] border border-[#d4af37]/20 rounded-xl">
            <span className="text-xs text-slate-400 font-sans">إجمالي الإستحقاق الشامل:</span>
            <p className="font-bold text-slate-100 mt-1">16,000.00 SAR</p>
          </div>
        </div>
      </div>
    </div>
  );
};
