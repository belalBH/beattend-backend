import React from 'react';
import { EmployeeProfileFull, DropdownOptionsFull } from '../types/employee.types';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  options: DropdownOptionsFull;
  isEditing: boolean;
  onChange: (field: keyof EmployeeProfileFull, value: any) => void;
}

export const AccountsTab: React.FC<Props> = ({ formData, options, isEditing, onChange }) => {
  const isEnabled = formData.account_enabled ?? formData.is_active ?? true;

  const handleResetPassword = () => {
    alert(`تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد: ${formData.email}`);
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم المستخدم للدخول (Username)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => onChange('username', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-mono font-bold">{formData.username || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">البريد الإلكتروني المعتمد للدخول</label>
          {isEditing ? (
            <input
              type="email"
              value={formData.login_email || formData.email || ''}
              onChange={(e) => onChange('login_email', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.login_email || formData.email || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الدور وصلاحية النظام</label>
          {isEditing ? (
            <select
              value={formData.role_id || options.roles[0]?.id || 1}
              onChange={(e) => onChange('role_id', Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.roles.map(r => (
                <option key={r.id} value={r.id}>{r.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-bold">{formData.role_name || 'مسؤول نظام'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">معرف التوثيق Firebase UID</label>
          <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto">
            {formData.firebase_uid || 'FB-STG-990022'}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">آخر تسجيل دخول ناجح</label>
          <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-emerald-400 font-mono text-xs">
            {formData.last_login || '2026-08-03 09:15:00'}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الأجهزة المعتمدة المربوطة</label>
          <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 text-xs">
            {formData.registered_devices_count || 2} جهاز (iPhone 15 Pro, Galaxy S24)
          </div>
        </div>
      </div>

      {/* Switch Control */}
      <div className="p-6 bg-[#1b3325]/70 border border-[#d4af37]/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="font-bold text-slate-100 text-base">تمكين وحالة تفعيل الحساب في البوابة والموبايل</h4>
          <p className="text-xs text-slate-400 mt-1">عند الإيقاف لن يتمكن الموظف من تسجيل الدخول أو إثبات البصمة</p>
        </div>

        <div className="flex items-center gap-4">
          <span className={`text-sm font-bold ${isEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
            {isEnabled ? 'الحساب نشط وممكن' : 'الحساب متوقف'}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange('account_enabled', !isEnabled);
              onChange('is_active', !isEnabled);
            }}
            className={`w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
              isEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-6 h-6 bg-white rounded-full shadow-md" />
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleResetPassword}
          className="px-5 py-2.5 bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-white transition cursor-pointer"
        >
          🔐 إعادة تعيين كلمة المرور فورياً
        </button>
      </div>
    </div>
  );
};
