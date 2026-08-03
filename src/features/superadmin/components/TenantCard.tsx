import React from 'react';
import { TenantFull } from '../types/superadmin.types';

interface Props {
  tenant: TenantFull;
  onToggleStatus: (tenant: TenantFull) => void;
  onViewDetails: (tenant: TenantFull) => void;
}

export const TenantCard: React.FC<Props> = ({
  tenant,
  onToggleStatus,
  onViewDetails
}) => {
  const usagePercentage = Math.round((tenant.current_employees_count / (tenant.max_employees || 50)) * 100);

  return (
    <div className="bg-[#1b3325]/80 border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4 text-right dir-rtl" dir="rtl">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <h3 className="text-lg font-bold text-slate-100">{tenant.company_name || tenant.company_code}</h3>
          </div>
          <p className="text-xs text-[#d4af37] font-mono mt-1">🌐 https://{tenant.subdomain}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          tenant.status === 'active'
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : tenant.status === 'suspended'
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-red-500/20 text-red-300 border-red-500/30'
        }`}>
          {tenant.status === 'active' ? '✓ شركة نشطة' : tenant.status === 'suspended' ? '⚠️ موقوفة' : '✕ منتهية الاشتراك'}
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-300 border-t border-[#d4af37]/10 pt-4 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">رمز الشركة (Company Code):</span>
          <span className="text-slate-100 font-bold">{tenant.company_code}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">الباقة المفعلة:</span>
          <span className="text-[#d4af37] font-bold">{tenant.plan_name || 'الباقة المؤسسية'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">حد الموظفين المسموح:</span>
          <span className="text-emerald-400 font-bold">{tenant.current_employees_count} / {tenant.max_employees} موظف</span>
        </div>

        {/* Usage Progress Bar */}
        <div className="w-full bg-[#0f1e16] rounded-full h-2 overflow-hidden border border-[#d4af37]/20 mt-1">
          <div
            className={`h-full transition-all duration-300 ${
              usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#d4af37]/10">
        <button
          type="button"
          onClick={() => onViewDetails(tenant)}
          className="py-2 px-3 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer text-center"
        >
          🔍 التفاصيل والاستهلاك
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(tenant)}
          className={`py-2 px-3 border rounded-xl text-xs font-bold transition cursor-pointer text-center ${
            tenant.status === 'active'
              ? 'bg-amber-900/40 text-amber-300 border-amber-500/30 hover:bg-amber-600 hover:text-white'
              : 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
          }`}
        >
          {tenant.status === 'active' ? '⏸️ تعليق الاشتراك' : '▶️ تفعيل الشركة'}
        </button>
      </div>
    </div>
  );
};
