import React from 'react';

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const EmployeeTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'basic', label: '1. المعلومات الأساسية', icon: '👤' },
    { id: 'job', label: '2. معلومات الوظيفة', icon: '🏢' },
    { id: 'emergency', label: '3. معلومات الطوارئ', icon: '🚨' },
    { id: 'documents', label: '4. المستندات والملفات', icon: '📁' },
    { id: 'accounts', label: '5. الحسابات للنظام', icon: '🔐' },
    { id: 'geofence', label: '6. الموقع الجغرافي', icon: '📍' },
    { id: 'bank', label: '7. البنك والمستحقات', icon: '🏦' },
    { id: 'additional', label: '8. معلومات إضافية', icon: '📋' },
    { id: 'attendance', label: '9. سجل الحضور', icon: '⏱️' },
    { id: 'leaves', label: '10. الإجازات والرصيد', icon: '📅' },
    { id: 'payroll', label: '11. مسير الرواتب', icon: '💰' },
    { id: 'audit', label: '12. سجل التعديلات', icon: '📜' }
  ];

  return (
    <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-2 flex overflow-x-auto shadow-xl backdrop-blur-md dir-rtl shrink-0 scrollbar-thin" dir="rtl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] shadow-lg scale-[1.02]'
              : 'text-slate-300 hover:bg-[#234735] hover:text-[#d4af37]'
          }`}
        >
          <span className="ml-1.5">{tab.icon}</span> {tab.label}
        </button>
      ))}
    </div>
  );
};
