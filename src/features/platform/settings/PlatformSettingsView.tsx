import React, { useState, useEffect } from 'react';

export const PlatformSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/php_api/api.php?route=platform_settings', {
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data || {});
      } else {
        setError(data.message || 'فشل تحميل إعدادات المنصة');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/php_api/api.php?route=platform_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert('تم حفظ إعدادات المنصة بنجاح مع القناع الأمني (Masked Secrets)');
      } else {
        alert(data.message || 'فشل حفظ الإعدادات');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚙️</span>
          <div>
            <h1 className="text-2xl font-black text-[#d4af37]">إعدادات المنصة العامة (Platform Settings)</h1>
            <p className="text-xs text-slate-400 mt-1">تحديد الهوية العامة، إعدادات SMTP، الضرائب وقيم المفاتيح السرية (Masked Credentials)</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#d4af37] space-y-3">
          <div className="w-10 h-10 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold">جاري تحميل إعدادات المنصة...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/80 border border-red-800 rounded-3xl text-red-200 text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-6 text-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-2 text-sm">🏛️ الإعدادات العامة والهوية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">اسم المنصة الرسمي</label>
                <input
                  type="text"
                  value={settings.platform_name || ''}
                  onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                  className="w-full p-2.5 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-white outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">البريد الإلكتروني للدعم</label>
                <input
                  type="email"
                  value={settings.platform_email || ''}
                  onChange={(e) => setSettings({ ...settings, platform_email: e.target.value })}
                  className="w-full p-2.5 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-white outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">نسبة ضريبة القيمة المضافة (%)</label>
                <input
                  type="number"
                  value={settings.tax_rate_percent || 15}
                  onChange={(e) => setSettings({ ...settings, tax_rate_percent: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-white font-mono outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-[#d4af37] border-b border-[#d4af37]/20 pb-2 text-sm">🔑 المفاتيح السرية والتكاملات (Masked Values)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">FCM Firebase Server Key</label>
                <input
                  type="text"
                  readOnly
                  value={settings.fcm_server_key || ''}
                  className="w-full p-2.5 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-[#d4af37] font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Mudad Integration Token</label>
                <input
                  type="text"
                  readOnly
                  value={settings.mudaad_api_token || ''}
                  className="w-full p-2.5 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-[#d4af37] font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 cursor-pointer"
            >
              {saving ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
