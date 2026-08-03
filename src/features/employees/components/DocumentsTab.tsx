import React from 'react';
import { EmployeeProfileFull } from '../types/employee.types';

interface Props {
  formData: Partial<EmployeeProfileFull>;
  isEditing: boolean;
  onChange: (field: keyof EmployeeProfileFull, value: any) => void;
}

export const DocumentsTab: React.FC<Props> = ({ formData, isEditing, onChange }) => {
  const documents = formData.documents || [];

  const handleUploadClick = () => {
    alert('تم محاكاة رفع المستند وحفظه في مجلد uploads في Staging Server');
  };

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      {isEditing && (
        <div className="flex justify-between items-center bg-[#1b3325]/90 p-4 rounded-2xl border border-[#d4af37]/30">
          <div>
            <h4 className="font-bold text-[#d4af37]">إضافة مستند جديد للموظف</h4>
            <p className="text-xs text-slate-400">إرفاق الهويات، الجوازات، عقود العمل والشهادات</p>
          </div>
          <button
            type="button"
            onClick={handleUploadClick}
            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs hover:brightness-110 cursor-pointer"
          >
            + رفع مستند جديد
          </button>
        </div>
      )}

      <div className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <table className="w-full text-right text-sm">
          <thead className="bg-[#0f1e16]/90 text-[#d4af37] border-b border-[#d4af37]/20 font-bold">
            <tr>
              <th className="p-4">نوع المستند</th>
              <th className="p-4">رقم المستند</th>
              <th className="p-4">تاريخ الإصدار</th>
              <th className="p-4">تاريخ الانتهاء</th>
              <th className="p-4">جهة الإصدار</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/10 text-slate-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-[#d4af37]/5 transition">
                <td className="p-4 font-bold text-slate-100">{doc.type}</td>
                <td className="p-4 font-mono text-[#d4af37]">{doc.document_number || '-'}</td>
                <td className="p-4 font-mono text-slate-400">{doc.issue_date || '-'}</td>
                <td className="p-4 font-mono text-emerald-400">{doc.expiry_date || '-'}</td>
                <td className="p-4 text-slate-300">{doc.issuer || '-'}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`عرض مستند: ${doc.type}`)}
                      className="px-3 py-1 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs font-semibold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                    >
                      👁️ عرض
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`تحميل مستند: ${doc.type}`)}
                      className="px-3 py-1 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition cursor-pointer"
                    >
                      ⬇️ تحميل
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = documents.filter(d => d.id !== doc.id);
                          onChange('documents', updated);
                        }}
                        className="px-3 py-1 bg-red-900/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-600 hover:text-white transition cursor-pointer"
                      >
                        🗑️ حذف
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
