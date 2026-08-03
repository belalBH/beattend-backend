import React from 'react';
import { FullEmployeeData, DropdownOptions } from './employee.types';

interface Props {
  formData: Partial<FullEmployeeData>;
  options: DropdownOptions;
  onChange: (field: keyof FullEmployeeData, value: any) => void;
}

export const EmployeePermissionsTab: React.FC<Props> = ({ formData, options, onChange }) => {
  const isEnabled = formData.account_enabled ?? formData.is_active ?? true;

  return (
    <div className="space-y-6 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم المستخدم للنظام (Username)</label>
          <input
            type="text"
            value={formData.username || ''}
            onChange={(e) => onChange('username', e.target.value)}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الدور والصلاحية الرئيسية</label>
          <select
            value={formData.role_id || options.roles[0]?.id || 1}
            onChange={(e) => onChange('role_id', Number(e.target.value))}
            className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
          >
            {options.roles.map(r => (
              <option key={r.id} value={r.id}>{r.name_ar}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modern Toggle Switch Requirement #8 */}
      <div className="p-4 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl flex items-center justify-between shadow-inner">
        <div>
          <h4 className="text-sm font-bold text-slate-100">حالة التفعيل والوصول للنظام</h4>
          <p className="text-xs text-slate-400 mt-0.5">التحكم في تمكين أو تعطيل دخول الموظف إلى البوابة وتطبيق الجوال</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold ${isEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
            {isEnabled ? 'نشط (Enabled)' : 'غير نشط (Disabled)'}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange('account_enabled', !isEnabled);
              onChange('is_active', !isEnabled);
            }}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
              isEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#1b3325]/40 border border-[#d4af37]/20 rounded-xl space-y-2 text-xs text-slate-300">
        <h5 className="font-bold text-[#d4af37]">ملخص الصلاحيات الممنوحة:</h5>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>تسجيل الحضور والانصراف الجغرافي من تطبيق الجوال</li>
          <li>تقديم طلبات الإجازات والاستئذانات الشخصية</li>
          <li>عرض وتحميل قسائم الرواتب والمستندات الرسمية</li>
          <li>تغيير كلمة المرور وتحديث البيانات الشخصية</li>
        </ul>
      </div>
    </div>
  );
};
