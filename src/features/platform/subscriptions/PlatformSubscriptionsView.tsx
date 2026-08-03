import React, { useState, useEffect } from 'react';

export const PlatformSubscriptionsView: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/php_api/api.php?route=platform_subscriptions', {
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.data || []);
      } else {
        setError(data.message || 'فشل تحميل قائمة الاشتراكات');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API الاشتراكات');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (sub: any) => {
    if (!window.confirm(`هل أنت تأكد من تجديد اشتراك منشأة (${sub.company_name || sub.company_code}) لمدّة 12 شهر إضافية؟`)) return;

    try {
      const res = await fetch('/php_api/api.php?route=platform_subscriptions&action=renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify({ subscription_id: sub.id, months: 12 })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم تمديد وتجديد الاشتراك بنجاح');
        loadSubscriptions();
      } else {
        alert(data.message || 'فشل تجديد الاشتراك');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال بالخادم عند التجديد');
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📅</span>
          <div>
            <h1 className="text-2xl font-black text-[#d4af37]">إدارة الاشتراكات والتجديدات (Subscriptions Lifecycle)</h1>
            <p className="text-xs text-slate-400 mt-1">متابعة حالة اشتراكات المنشآت، تجديد الاشتراك، التمديد، وترقية الباقات</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#d4af37] space-y-3">
          <div className="w-10 h-10 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold">جاري تحميل قائمة الاشتراكات حياً...</div>
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
                  <th className="p-3">اسم المنشأة</th>
                  <th className="p-3">الباقة الحالية</th>
                  <th className="p-3">تاريخ البداية</th>
                  <th className="p-3">تاريخ الانتهاء</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4af37]/10">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#182f22]">
                    <td className="p-3 font-bold text-slate-100">{sub.company_name || sub.company_code}</td>
                    <td className="p-3 text-[#d4af37] font-bold">{sub.plan_name || 'الباقة المؤسسية'}</td>
                    <td className="p-3 font-mono text-slate-400">{sub.start_date?.split(' ')[0]}</td>
                    <td className="p-3 font-mono text-amber-300 font-bold">{sub.end_date?.split(' ')[0]}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {sub.status === 'active' ? '🟢 ساري' : '🔴 منتهي'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleRenew(sub)}
                        className="px-3 py-1.5 bg-[#07120c] border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-bold rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                      >
                        🔄 تمديد (12 شهر)
                      </button>
                    </td>
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
