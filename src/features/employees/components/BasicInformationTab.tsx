import React from 'react';
import { EmployeeProfileFull, DropdownOptionsFull } from '../types/employee.types';
import { FieldErrorsFull } from '../validation/employee.validation';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  options: DropdownOptionsFull;
  isEditing: boolean;
  onChange: (field: keyof EmployeeProfileFull, value: any) => void;
  errors: FieldErrorsFull;
}

export const BasicInformationTab: React.FC<Props> = ({ formData, options, isEditing, onChange, errors }) => {
  const generateEmpNo = () => {
    const generated = 'EMP-' + Math.floor(1000 + Math.random() * 9000);
    onChange('empNo', generated);
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      {/* 3 Columns Grid Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الاسم الأول *</label>
          {isEditing ? (
            <input
              type="text"
              required
              value={formData.first_name || ''}
              onChange={(e) => onChange('first_name', e.target.value)}
              className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 focus:outline-none ${errors.first_name ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100 font-bold">{formData.first_name || '-'}</div>
          )}
          {errors.first_name && <p className="text-xs text-red-400 mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم العائلة *</label>
          {isEditing ? (
            <input
              type="text"
              required
              value={formData.last_name || ''}
              onChange={(e) => onChange('last_name', e.target.value)}
              className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 focus:outline-none ${errors.last_name ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100 font-bold">{formData.last_name || '-'}</div>
          )}
          {errors.last_name && <p className="text-xs text-red-400 mt-1">{errors.last_name}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الاسم بالعربية</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name_ar || `${formData.first_name || ''} ${formData.last_name || ''}`}
              onChange={(e) => onChange('name_ar', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100 font-bold">{formData.name_ar || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الاسم بالإنجليزية</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name_en || ''}
              onChange={(e) => onChange('name_en', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100">{formData.name_en || '-'}</div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs text-slate-300 font-semibold">الرقم الوظيفي (Emp No) *</label>
            {isEditing && (
              <button
                type="button"
                onClick={generateEmpNo}
                className="text-[10px] text-[#d4af37] underline hover:text-white font-bold"
              >
                🔄 توليد تلقائي
              </button>
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              required
              value={formData.empNo || ''}
              onChange={(e) => onChange('empNo', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-mono font-bold">{formData.empNo || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الهوية / الإقامة</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.national_id || ''}
              onChange={(e) => onChange('national_id', e.target.value)}
              className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.national_id ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.national_id || '-'}</div>
          )}
          {errors.national_id && <p className="text-xs text-red-400 mt-1">{errors.national_id}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الجنسية</label>
          {isEditing ? (
            <select
              value={formData.nationality || 'سعودي'}
              onChange={(e) => onChange('nationality', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.nationalities.map(n => (
                <option key={n.id} value={n.name_ar}>{n.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.nationality || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الجنس</label>
          {isEditing ? (
            <select
              value={formData.gender || 'male'}
              onChange={(e) => onChange('gender', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.gender === 'female' ? 'أنثى' : 'ذكر'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">تاريخ الميلاد</label>
          {isEditing ? (
            <input
              type="date"
              value={formData.dob || ''}
              onChange={(e) => onChange('dob', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.dob || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">الحالة الاجتماعية</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.marital_status || 'متزوج'}
              onChange={(e) => onChange('marital_status', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.marital_status || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">البريد الإلكتروني *</label>
          {isEditing ? (
            <input
              type="email"
              required
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.email ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-mono">{formData.email || '-'}</div>
          )}
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الهاتف الأساسي</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.phone ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.phone || '-'}</div>
          )}
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم جوال إضافي</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.secondary_phone || ''}
              onChange={(e) => onChange('secondary_phone', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.secondary_phone || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">العنوان الوطني</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.national_address || ''}
              onChange={(e) => onChange('national_address', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.national_address || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">المدينة</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.city || 'الرياض'}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.city || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">تاريخ انتهاء الهوية / الإقامة</label>
          {isEditing ? (
            <input
              type="date"
              value={formData.iqama_expiry_date || ''}
              onChange={(e) => onChange('iqama_expiry_date', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.iqama_expiry_date || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">حالة الموظف التشغيلية</label>
          {isEditing ? (
            <select
              value={formData.status || 'active'}
              onChange={(e) => onChange('status', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="active">نشط (Active)</option>
              <option value="inactive">غير نشط (Inactive)</option>
              <option value="suspended">موقوف (Suspended)</option>
              <option value="resigned">مستقيل (Resigned)</option>
              <option value="terminated">منتهي العقد (Terminated)</option>
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl font-bold">
              <span className={`px-3 py-1 rounded-full text-xs border ${
                formData.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {formData.status === 'active' ? 'نشط' : formData.status === 'suspended' ? 'موقوف' : 'غير نشط'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
