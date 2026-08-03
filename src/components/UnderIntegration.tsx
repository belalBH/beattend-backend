import React from 'react';

interface Props {
  moduleName: string;
}

export const UnderIntegration: React.FC<Props> = ({ moduleName }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#1b3325]/60 border border-[#d4af37]/30 rounded-2xl text-center backdrop-blur-md my-8">
      <div className="w-16 h-16 mb-4 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-2xl font-bold border border-[#d4af37]/40 animate-pulse">
        ⏳
      </div>
      <h3 className="text-2xl font-bold text-[#d4af37] mb-2">وحدة {moduleName} قيد الربط والتكامل (Under Integration)</h3>
      <p className="text-[#94a3b8] max-w-md text-sm leading-relaxed mb-6">
        يتم حالياً تجهيز واختبار الـ Endpoints الخاصة بهذه الوحدة على سيرفر الـ Staging لضمان عدم التأثير على التطبيق والخدمات الحية.
      </p>
      <span className="px-4 py-1.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-full text-xs font-semibold">
        الحالة: بانتظار التحقق من الـ Backend
      </span>
    </div>
  );
};
