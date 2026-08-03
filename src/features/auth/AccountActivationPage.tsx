import React, { useState, useEffect } from 'react';

interface Props {
  onActivationSuccess: (email: string, companyCode: string) => void;
}

export const AccountActivationPage: React.FC<Props> = ({ onActivationSuccess }) => {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<any>(null);

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activationDone, setActivationDone] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get('token') || window.location.hash.split('token=')[1] || '';
    setToken(tok);

    if (tok) {
      verifyInvitationToken(tok);
    } else {
      setError('رمز التفعيل (Token) مفقود في الرابط');
      setLoading(false);
    }
  }, []);

  const verifyInvitationToken = async (tok: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/php_api/api.php?route=invitation_verify&token=${encodeURIComponent(tok)}`);
      const data = await res.json();
      if (data.success) {
        setInvitationInfo(data.data);
      } else {
        setError(data.message || 'رمز التفعيل غير صالح أو منتهي الصلاحية');
      }
    } catch (err: any) {
      setError('فصل الاتصال بخادم التفعيل');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تتكون من 6 خانات على الأقل');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/php_api/api.php?route=invitation_activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (data.success) {
        setActivationDone(true);
      } else {
        setError(data.message || 'فشل تفعيل الحساب');
      }
    } catch (err: any) {
      setError('تعذر تفعيل الحساب، يرجى المحاولة لاحقاً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f1e16] text-slate-100 font-sans p-6 dir-rtl" dir="rtl">
      <div className="max-w-md w-full bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] text-[#0f1e16] font-black text-2xl flex items-center justify-center shadow-lg">
            B
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#d4af37]">BeatAttend</h1>
            <p className="text-xs text-slate-400">تفعيل حساب مسؤول المنشأة</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8 text-slate-300 text-sm font-bold animate-pulse">
            جاري التحقق من رابط الدعوة والتفعيل...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-2xl text-red-200 text-xs font-bold space-y-2 text-center">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && invitationInfo && !activationDone && (
          <form onSubmit={handleActivateSubmit} className="space-y-4">
            <div className="p-3 bg-[#0f1e16]/60 border border-[#d4af37]/20 rounded-2xl text-xs space-y-1">
              <div className="text-slate-400">المنشأة الدعوة: <span className="text-[#d4af37] font-bold">{invitationInfo.company_name} ({invitationInfo.company_code})</span></div>
              <div className="text-slate-400">البريد الإلكتروني: <span className="text-slate-200 font-mono font-bold">{invitationInfo.email}</span></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">تعيين كلمة المرور الجديدة *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">تأكيد كلمة المرور *</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'جاري تفعيل الحساب...' : '🔒 تفعيل الحساب والتعيين ←'}
            </button>
          </form>
        )}

        {activationDone && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-3xl flex items-center justify-center mx-auto">
              ✓
            </div>
            <h3 className="text-lg font-bold text-emerald-400">تم تفعيل حسابك بنجاح!</h3>
            <p className="text-xs text-slate-300">
              تم تعيين كلمة المرور الخاصة بك بنجاح. يمكنك الآن الانتقال لشاشة الدخول وتسجيل الدخول ببريدك الإلكتروني.
            </p>
            <button
              type="button"
              onClick={() => onActivationSuccess(invitationInfo.email, invitationInfo.company_code)}
              className="px-6 py-3 bg-[#d4af37] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:bg-white transition cursor-pointer"
            >
              🔑 الانتقال إلى شاشة الدخول ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
