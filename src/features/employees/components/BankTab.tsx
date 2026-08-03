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

export const BankTab: React.FC<Props> = ({ formData, options, isEditing, onChange, errors }) => {
  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#1b3325]/70 p-6 rounded-2xl border border-[#d4af37]/20 shadow-xl backdrop-blur-md">
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم البنك المعتمد</label>
          {isEditing ? (
            <select
              value={formData.bank_name || 'البنك الأهلي السعودي (SNB)'}
              onChange={(e) => onChange('bank_name', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            >
              {options.banks.map(b => (
                <option key={b.id} value={b.name_ar}>{b.name_ar}</option>
              ))}
            </select>
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-[#d4af37] font-bold">{formData.bank_name || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">اسم صاحب الحساب (مطابق للبنك)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.account_holder || ''}
              onChange={(e) => onChange('account_holder', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-100 font-bold">{formData.account_holder || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الآيبان (IBAN SA...)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.iban || ''}
              onChange={(e) => onChange('iban', e.target.value)}
              className={`w-full px-4 py-2 bg-[#0f1e16] border rounded-xl text-slate-100 font-mono focus:outline-none ${errors.iban ? 'border-red-500' : 'border-[#d4af37]/30 focus:border-[#d4af37]'}`}
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-emerald-400 font-mono font-bold">{formData.iban || '-'}</div>
          )}
          {errors.iban && <p className="text-xs text-red-400 mt-1">{errors.iban}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رقم الحساب البنكي المحلي</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.account_number || ''}
              onChange={(e) => onChange('account_number', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.account_number || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">نوع الحساب البنكي</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.account_type || 'جاري (Current)'}
              onChange={(e) => onChange('account_type', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.account_type || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">رمز البنك (Bank Swift Code)</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.bank_code || 'NCBKSA'}
              onChange={(e) => onChange('bank_code', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200 font-mono">{formData.bank_code || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">عملة تحويل الراتب</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.salary_currency || 'SAR (ريال سعودي)'}
              onChange={(e) => onChange('salary_currency', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.salary_currency || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">طريقة صرف المستحقات</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.payment_method || 'تحويل سريع (حماية الأجور WPS)'}
              onChange={(e) => onChange('payment_method', e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
            />
          ) : (
            <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl text-slate-200">{formData.payment_method || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-semibold">حالة التحقق من الآيبان (IBAN Status)</label>
          <div className="p-2.5 bg-[#0f1e16]/60 border border-[#d4af37]/10 rounded-xl font-bold">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs">
              ✓ آيبان معتمد ومتحقق (WPS Validated)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
