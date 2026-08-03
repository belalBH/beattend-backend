import React from 'react';

interface Props {
  searchTerm: string;
  selectedCompany: string;
  selectedBranch: string;
  onSearchChange: (v: string) => void;
  onCompanyChange: (v: string) => void;
  onBranchChange: (v: string) => void;
}

export const AttendanceFilters: React.FC<Props> = ({
  searchTerm,
  selectedCompany,
  selectedBranch,
  onSearchChange,
  onCompanyChange,
  onBranchChange
}) => {
  return (
    <div className="bg-[#1b3325]/90 border border-[#d4af37]/30 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row gap-3 justify-between items-center dir-rtl" dir="rtl">
      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <select
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="px-3 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#d4af37]"
        >
          <option value="">جميع الشركات</option>
          <option value="1">شركة الحلول المتقدمة (Solutions Co)</option>
        </select>

        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="px-3 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#d4af37]"
        >
          <option value="">جميع الفروع والمواقع</option>
          <option value="fayha">مقر Fayha Branch الرئيسي</option>
          <option value="naseem">فرع النسيم HQ</option>
        </select>
      </div>

      <div className="w-full md:w-72">
        <input
          type="text"
          placeholder="بحث باسم الموظف، الرقم الوظيفي..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-[#d4af37]"
        />
      </div>
    </div>
  );
};
