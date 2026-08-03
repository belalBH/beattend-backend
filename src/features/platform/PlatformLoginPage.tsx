import React, { useState } from 'react';

interface Props {
  onLoginSuccess: (token: string, user: any) => void;
}

export const PlatformLoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('superadmin@beattend.com');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('البريد الإلكتروني وكلمة المرور حقول إجبارية');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/php_api/api.php?route=platform_auth_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || '⚠️ بيانات الدخول غير صحيحة أو غير مصرح بها بالسوبر أدمن');
        setSubmitting(false);
        return;
      }

      localStorage.setItem('beattend_platform_token', data.data.token);
      localStorage.setItem('beattend_platform_user', JSON.stringify(data.data.user));

      setSubmitting(false);
      onLoginSuccess(data.data.token, data.data.user);

    } catch (err: any) {
      setError('تعذر الاتصال بخادم مصادقة منصة BeatAttend');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07120c] text-slate-100 font-sans p-6 dir-rtl" dir="rtl">
      <div className="max-w-md w-full bg-[#12241a] border border-[#d4af37]/40 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-3xl flex items-center justify-center mx-auto shadow-xl">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-[#d4af37] tracking-wide">بوابة إدارة المنصة (Platform Admin)</h1>
          <p className="text-xs text-slate-400 font-medium">مصادقة مستقلة فائقة الحماية للسوبر أدمن فقط</p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-2xl text-red-200 text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">بريد السوبر أدمن *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@beattend.com"
              className="w-full px-4 py-3.5 bg-[#0a1811] border border-[#d4af37]/30 rounded-2xl text-slate-100 font-mono text-sm focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-slate-300 font-bold">كلمة المرور *</label>
              <a
                href="#forgot"
                onClick={(e) => { e.preventDefault(); alert('يرجى التواصل مع قسم الأمن السيبراني بالمنصة لإعادة التعيين'); }}
                className="text-[11px] text-[#d4af37] hover:underline font-semibold"
              >
                نسيت كلمة المرور؟
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-[#0a1811] border border-[#d4af37]/30 rounded-2xl text-slate-100 font-mono text-sm focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#d4af37] w-4 h-4 rounded cursor-pointer"
              />
              <span>تذكر الجلسة على هذا الجهاز</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-extrabold rounded-2xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'جاري التحقق من الهوية الفائقة...' : '🔑 دخول لوحة المنصة ←'}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 font-mono pt-4 border-t border-[#d4af37]/10">
          BeatAttend Platform Security Architecture 2026 ©
        </div>
      </div>
    </div>
  );
};
