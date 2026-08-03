import React, { useState, useEffect } from 'react';

export const PlatformUsersView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [availablePerms, setAvailablePerms] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('Admin@2026!');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadPlatformUsers();
  }, []);

  const loadPlatformUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/php_api/api.php?route=platform_users', {
        headers: { 'X-Platform-Token': 'PlatformSuperAdminSecret2026!' }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users || []);
        setAvailablePerms(data.data.available_permissions || {});
      } else {
        setError(data.message || 'فشل تحميل مستخدمي المنصة');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API مستخدمي المنصة');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;

    setSubmitting(true);
    try {
      const res = await fetch('/php_api/api.php?route=platform_users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Token': 'PlatformSuperAdminSecret2026!'
        },
        body: JSON.stringify({ email, full_name: fullName, password })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم إضافة مستخدم المنصة وتعيين صلاحيات السوبر أدمن بنجاح');
        setIsModalOpen(false);
        setEmail('');
        setFullName('');
        loadPlatformUsers();
      } else {
        alert(data.message || 'فشل إضافة المستخدم');
      }
    } catch (err: any) {
      alert('خطأ في الاتصال أثناء إضافة المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      <div className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <h1 className="text-2xl font-black text-[#d4af37]">مستخدمو المنصة وصلاحيات الأدمن (Platform RBAC)</h1>
            <p className="text-xs text-slate-400 mt-1">إضافة موظفي فريق السوبر أدمن BeatAttend وإسناد الأدوار والصلاحيات الدقيقة</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-2xl text-xs shadow-xl hover:brightness-110 transition cursor-pointer"
        >
          ➕ إضافة أدمن جديد للمنصة
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#d4af37] space-y-3">
          <div className="w-10 h-10 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold">جاري تحميل مستخدمي المنصة...</div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/80 border border-red-800 rounded-3xl text-red-200 text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((u) => (
            <div key={u.id} className="bg-[#12241a] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{u.full_name}</h3>
                  <p className="text-xs text-[#d4af37] font-mono mt-0.5">{u.email}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full">
                  {u.role_title}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#d4af37]/15 text-xs">
                <div className="text-slate-400 font-bold mb-1">الصلاحيات الممنوحة:</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(availablePerms).map(([permKey, permLabel]: any) => (
                    <span key={permKey} className="text-[10px] bg-[#07120c] text-slate-300 border border-[#d4af37]/20 px-2 py-0.5 rounded-lg">
                      ✓ {permLabel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
          <div className="bg-[#12241a] border border-[#d4af37]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
              <h3 className="text-lg font-bold text-[#d4af37]">إضافة مستخدم أدمن للمنصة</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: المهندس أحمد العتيبي"
                  className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني الرسمي *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@beattend.com"
                  className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">كلمة المرور الافتراضية</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-[#07120c] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl shadow-lg hover:brightness-110"
                >
                  {submitting ? 'جاري الإضافة...' : 'إضافة الأدمن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
