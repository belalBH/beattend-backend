import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { Company } from '../../types';

export const CompaniesView: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCompanies();
      setCompanies(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات الشركات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#d4af37] font-semibold animate-pulse">
        جاري تحميل بيانات الشركات من خادم الـ Staging...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/30 border border-red-500/40 rounded-xl text-red-300 text-center my-4">
        <p className="font-bold">خطأ في الاتصال بالشبكة:</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={loadCompanies} className="mt-4 px-4 py-1.5 bg-[#d4af37] text-[#0f1e16] rounded-lg font-bold hover:bg-[#f3e5ab]">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1b3325]/80 p-6 rounded-2xl border border-[#d4af37]/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-[#d4af37]">إدارة الشركات والفروع</h2>
          <p className="text-sm text-slate-400 mt-1">عرض وتخصيص الشركات التابعة والمنشآت المعتمدة في النظام</p>
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110 transition">
          + إضافة شركة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-[#1b3325]/60 border border-[#d4af37]/20 rounded-2xl p-6 hover:border-[#d4af37]/60 transition shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100">{company.name_ar}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{company.name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${company.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {company.is_active ? 'نشطة' : 'متوقفة'}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-300 border-t border-[#d4af37]/10 pt-4 mt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">السجل التجاري:</span>
                <span className="font-mono text-[#d4af37]">{company.cr_number || '1010884920'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الرقم الضريبي:</span>
                <span className="font-mono text-[#d4af37]">{company.tax_number || '3109923849'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
