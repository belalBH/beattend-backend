import React, { useState, useEffect } from 'react';

export const PlatformSupportView: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/php_api/api.php?route=platform_support', {
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.data || []);
      } else {
        setError(data.message || 'فشل تحميل تذاكر الدعم الفني');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API التذاكر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💬</span>
          <div>
            <h1 className="text-2xl font-black text-[#d4af37]">مركز الدعم الفني والتذاكر (Support Desk Engine)</h1>
            <p className="text-xs text-slate-400 mt-1">متابعة طلبات الدعم، الردود الرسمية، الملاحظات الداخلية وتتبع الـ SLA</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#d4af37] space-y-3">
          <div className="w-10 h-10 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold">جاري تحميل تذاكر الدعم الفني...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/80 border border-red-800 rounded-3xl text-red-200 text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      ) : (
        <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right text-slate-200">
              <thead className="bg-[#07120c] text-[#d4af37] border-b border-[#d4af37]/20">
                <tr>
                  <th className="p-3">رقم التذكرة</th>
                  <th className="p-3">المنشأة</th>
                  <th className="p-3">الموضوع</th>
                  <th className="p-3">الأولوية</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">تاريخ الفتح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/10">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#182f22]">
                    <td className="p-3 font-mono text-[#d4af37] font-bold">{t.ticket_number}</td>
                    <td className="p-3 font-bold">{t.company_name}</td>
                    <td className="p-3 text-slate-100">{t.subject}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'}`}>
                        {t.priority === 'high' ? 'عالية' : 'متوسطة'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 font-bold rounded-full text-[10px]">
                        {t.status === 'open' ? 'جديدة' : 'قيد المعالجة'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{t.created_at?.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
