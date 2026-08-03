import React, { useState } from 'react';
import { AttendanceDashboardPage } from './pages/AttendanceDashboardPage';
import { AttendanceLogsPage } from './pages/AttendanceLogsPage';
import { LiveAttendancePage } from './pages/LiveAttendancePage';
import { AttendanceApprovalsPage } from './pages/AttendanceApprovalsPage';
import { GeofencesPage } from './pages/GeofencesPage';
import { DevicesPage } from './pages/DevicesPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { AttendanceReportsPage } from './pages/AttendanceReportsPage';

export const AttendanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const tabs = [
    { id: 'dashboard', label: '1. لوحة الحضور الرئيسية', icon: '📊' },
    { id: 'logs', label: '2. سجلات الحضور التفصيلية', icon: '📋' },
    { id: 'live', label: '3. الحضور المباشر LIVE', icon: '🟢' },
    { id: 'approvals', label: '4. الموافقات والطلبات', icon: '✅' },
    { id: 'geofences', label: '5. المواقع الجغرافية', icon: '📍' },
    { id: 'devices', label: '6. الأجهزة المسجلة', icon: '📱' },
    { id: 'exceptions', label: '7. الاستثناءات والإنذارات', icon: '⚠️' },
    { id: 'reports', label: '8. التقارير الجاهزة والتصدير', icon: '📈' }
  ];

  return (
    <div className="space-y-6 dir-rtl text-right p-2 md:p-6" dir="rtl">
      {/* 8 Sub-Tabs Header Navigation Bar */}
      <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-2 flex overflow-x-auto shadow-xl backdrop-blur-md shrink-0 scrollbar-thin" dir="rtl">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] shadow-lg scale-[1.02]'
                : 'text-slate-300 hover:bg-[#234735] hover:text-[#d4af37]'
            }`}
          >
            <span className="ml-1.5">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Main Sub-Page Display */}
      <div>
        {activeTab === 'dashboard' && <AttendanceDashboardPage onNavigateTab={setActiveTab} />}
        {activeTab === 'logs' && <AttendanceLogsPage />}
        {activeTab === 'live' && <LiveAttendancePage />}
        {activeTab === 'approvals' && <AttendanceApprovalsPage />}
        {activeTab === 'geofences' && <GeofencesPage />}
        {activeTab === 'devices' && <DevicesPage />}
        {activeTab === 'exceptions' && <ExceptionsPage />}
        {activeTab === 'reports' && <AttendanceReportsPage />}
      </div>
    </div>
  );
};
