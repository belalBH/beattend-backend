import React, { useState } from 'react';
import { FullEmployeeData } from './employee.types';

interface Props {
  employee: FullEmployeeData;
  onClose: () => void;
}

export const EmployeeFullProfileModal: React.FC<Props> = ({ employee, onClose }) => {
  const [profileTab, setProfileTab] = useState<string>('personal');

  const tabs = [
    { id: 'personal', label: 'البيانات الشخصية', icon: '👤' },
    { id: 'job', label: 'البيانات الوظيفية', icon: '🏢' },
    { id: 'attendance', label: 'سجل الحضور', icon: '⏱️' },
    { id: 'leaves', label: 'الإجازات والرصيد', icon: '📅' },
    { id: 'payroll', label: 'الرواتب والمستحقات', icon: '💰' },
    { id: 'documents', label: 'المستندات', icon: '📁' },
    { id: 'devices', label: 'الأجهزة المعتمدة', icon: '📱' },
    { id: 'permissions', label: 'الصلاحيات', icon: '🔐' },
    { id: 'audit', label: 'سجل التعديلات', icon: '📜' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#1b3325] border border-[#d4af37]/50 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden dir-rtl" dir="rtl">
        {/* Header */}
        <div className="p-6 bg-[#0f1e16]/80 border-b border-[#d4af37]/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-2xl flex items-center justify-center border-2 border-[#d4af37] shadow-lg">
              {employee.first_name ? employee.first_name[0] : 'E'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#d4af37]">{employee.first_name} {employee.last_name}</h2>
                <span className="px-3 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                  {employee.status === 'active' ? 'نشط' : 'تعطيل'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                الرقم الوظيفي: <span className="text-[#d4af37]">{employee.empNo}</span> | البريد: <span className="text-slate-200">{employee.email}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white font-bold text-xl px-3 py-1">✕</button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="bg-[#1b3325] border-b border-[#d4af37]/20 flex overflow-x-auto shrink-0 px-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setProfileTab(t.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                profileTab === t.id
                  ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10'
                  : 'border-transparent text-slate-300 hover:text-[#d4af37]'
              }`}
            >
              <span className="ml-1">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto text-slate-100 text-right space-y-6">
          {profileTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0f1e16]/60 p-6 rounded-2xl border border-[#d4af37]/20">
              <div>
                <span className="text-xs text-slate-400">الاسم الكامل:</span>
                <p className="font-bold text-slate-100 mt-1">{employee.first_name} {employee.last_name}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">البريد الإلكتروني:</span>
                <p className="font-mono text-[#d4af37] mt-1">{employee.email}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">رقم الجوال:</span>
                <p className="font-mono text-slate-200 mt-1">{employee.phone || '0501234567'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">رقم الهوية / الإقامة:</span>
                <p className="font-mono text-slate-200 mt-1">{employee.national_id || '1098765432'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">الجنس:</span>
                <p className="text-slate-200 mt-1">{employee.gender === 'female' ? 'أنثى' : 'ذكر'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">تاريخ الميلاد:</span>
                <p className="font-mono text-slate-200 mt-1">{employee.dob || '1992-05-15'}</p>
              </div>
            </div>
          )}

          {profileTab === 'job' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0f1e16]/60 p-6 rounded-2xl border border-[#d4af37]/20">
              <div>
                <span className="text-xs text-slate-400">الشركة:</span>
                <p className="font-bold text-[#d4af37] mt-1">{employee.company_name || 'Solutions Co'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">القسم:</span>
                <p className="font-bold text-slate-100 mt-1">{employee.department_name || 'تقنية المعلومات'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">المسمى الوظيفي:</span>
                <p className="text-slate-200 mt-1">{employee.job_title || 'مدير النظم والتقنية'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">تاريخ التوظيف:</span>
                <p className="font-mono text-slate-200 mt-1">{employee.hire_date || '2024-01-01'}</p>
              </div>
            </div>
          )}

          {profileTab === 'attendance' && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#d4af37]">سجلات الحضور والبصمات الأخيرة:</h4>
              <div className="bg-[#0f1e16]/80 p-4 rounded-xl border border-[#d4af37]/20 text-sm font-mono flex justify-between">
                <span>2026-08-03 (08:00 AM - 04:30 PM)</span>
                <span className="text-emerald-400 font-bold">حاضر (Fayha Branch)</span>
              </div>
              <div className="bg-[#0f1e16]/80 p-4 rounded-xl border border-[#d4af37]/20 text-sm font-mono flex justify-between">
                <span>2026-08-02 (08:15 AM - 04:30 PM)</span>
                <span className="text-amber-400 font-bold">متأخر 15 دقيقة</span>
              </div>
            </div>
          )}

          {['leaves', 'payroll', 'documents', 'devices', 'permissions', 'audit'].includes(profileTab) && (
            <div className="p-8 text-center text-slate-400 bg-[#0f1e16]/60 rounded-2xl border border-[#d4af37]/20">
              <p className="text-lg font-bold text-[#d4af37] mb-2">سجلات قسم ({tabs.find(t=>t.id===profileTab)?.label})</p>
              <p className="text-xs text-slate-400">جميع السجلات والملفات متاحة وموثقة في قاعدة بيانات الـ Staging</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0f1e16] border-t border-[#d4af37]/20 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#d4af37] text-[#0f1e16] font-bold rounded-xl text-sm hover:brightness-110"
          >
            إغلاق الملف
          </button>
        </div>
      </div>
    </div>
  );
};
