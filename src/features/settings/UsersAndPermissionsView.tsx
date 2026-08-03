import React, { useState, useEffect } from 'react';

export const UsersAndPermissionsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'matrix' | 'scopes' | 'invitations' | 'audit'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [savingRole, setSavingRole] = useState<boolean>(false);

  // New User Form State
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([2]);
  const [userDataScope, setUserDataScope] = useState<string>('all_company');
  const [savingUser, setSavingUser] = useState<boolean>(false);

  useEffect(() => {
    loadRbacData();
  }, []);

  const loadRbacData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, rRes, mRes] = await Promise.all([
        fetch('/php_api/api.php?route=tenant_users'),
        fetch('/php_api/api.php?route=tenant_roles'),
        fetch('/php_api/api.php?route=tenant_permissions_modules')
      ]);

      const uData = await uRes.json();
      const rData = await rRes.json();
      const mData = await mRes.json();

      if (uData.success) setUsers(uData.data || []);
      if (rData.success) setRoles(rData.data || []);
      if (mData.success) setModules(mData.data || []);

    } catch (err: any) {
      setError('فشل تحميل مصفوفة الصلاحيات والأدوار من خادم Staging');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setSavingRole(true);
    try {
      const res = await fetch('/php_api/api.php?route=tenant_roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_ar: newRoleName,
          permission_ids: selectedPermissions
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewRoleName('');
        setSelectedPermissions([]);
        loadRbacData();
        alert('تم حفظ الدور المخصص ومصفوفة الصلاحيات بنجاح');
      } else {
        alert(data.message || 'فشل حفظ الدور');
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء حفظ الدور');
    } finally {
      setSavingRole(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userFullName) return;

    setSavingUser(true);
    try {
      const res = await fetch('/php_api/api.php?route=tenant_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          full_name: userFullName,
          role_ids: selectedRoleIds,
          scope_type: userDataScope
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsUserModalOpen(false);
        setUserEmail('');
        setUserFullName('');
        loadRbacData();
        alert('تم إضافة المستخدم وتعيين الأدوار المتعددة ونطاق الوصول بنجاح');
      } else {
        alert(data.message || 'فشل إضافة المستخدم');
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء إضافة المستخدم');
    } finally {
      setSavingUser(false);
    }
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const selectAllPermissions = () => {
    const allIds = modules.flatMap(m => m.permissions.map((p: any) => p.id));
    setSelectedPermissions(allIds);
  };

  const selectViewOnlyPermissions = () => {
    const viewIds = modules.flatMap(m => m.permissions.filter((p: any) => p.action_type === 'view').map((p: any) => p.id));
    setSelectedPermissions(viewIds);
  };

  return (
    <div className="space-y-6 dir-rtl text-right p-2 md:p-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔐</span>
            <div>
              <h1 className="text-2xl font-black text-[#d4af37]">إدارة المستخدمين والصلاحيات (RBAC & Data Scopes Suite)</h1>
              <p className="text-xs text-slate-300 mt-1">الأدوار المتعددة، مصفوفة الصلاحيات الموديلار، نطاق الوصول، ومحرك الموافقات الموحد</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsUserModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
        >
          + إضافة مستخدم إداري جديد
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#d4af37]/20 pb-3">
        {[
          { id: 'users', label: '👥 المستخدمين', count: users.length },
          { id: 'roles', label: '🛡️ الأدوار المتعددة', count: roles.length },
          { id: 'matrix', label: '⚡ مصفوفة الصلاحيات الموديلار', count: modules.length },
          { id: 'scopes', label: '🌐 نطاقات الوصول (Data Scopes)' },
          { id: 'invitations', label: '✉️ الدعوات والجلسات' },
          { id: 'audit', label: '📜 سجل الدخول والأمان' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#d4af37] text-[#0f1e16] shadow-lg'
                : 'bg-[#1b3325]/80 text-slate-300 border border-[#d4af37]/20 hover:text-[#d4af37]'
            }`}
          >
            {tab.label} {tab.count !== undefined && <span className="font-mono opacity-80">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-12 text-[#d4af37] text-sm font-bold animate-pulse">
          جاري استرجاع مصفوفة الصلاحيات والأدوار الموديلار من قاعدة بيانات Staging...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/60 border border-red-500 rounded-2xl text-red-200 text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      )}

      {/* TAB 1: USERS */}
      {!loading && activeTab === 'users' && (
        <div className="bg-[#1b3325]/90 border border-[#d4af37]/20 rounded-3xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-xs text-slate-200">
            <thead>
              <tr className="border-b border-[#d4af37]/20 text-slate-400 font-bold">
                <th className="p-3 text-right">الاسم والبريد</th>
                <th className="p-3 text-right">الأدوار المخصصة (Many-to-Many)</th>
                <th className="p-3 text-right">نطاق الوصول (Data Scope)</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10">
              {users.map((u) => (
                <tr key={u.membership_id} className="hover:bg-[#0f1e16]/50 transition">
                  <td className="p-3 font-bold">
                    <div className="text-slate-100">{u.full_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-bold rounded-lg text-[11px]">
                      {u.assigned_roles_str || 'Company Admin'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[11px] font-mono">
                      {u.data_scope?.scope_type || 'all_company'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                      🟢 نشط
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => alert(`تعديل صلاحيات المستخدم: ${u.full_name}`)}
                      className="px-3 py-1 bg-[#0f1e16] border border-[#d4af37]/30 text-[#d4af37] rounded-lg hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                    >
                      ✏️ تعديل الصلاحيات
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ROLES */}
      {!loading && activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.id} className="bg-[#1b3325]/90 border border-[#d4af37]/20 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-[#d4af37] text-sm">{r.name_ar}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{r.name_en}</p>
                </div>
                {r.is_default ? (
                  <span className="px-2 py-0.5 bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold rounded-full border border-[#d4af37]/30">
                    افتراضي
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-full">
                    مخصص
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">{r.description || 'دور معتمد بالنظام'}</p>
              <div className="pt-2 border-t border-[#d4af37]/10 flex justify-between text-xs text-slate-400">
                <span>المستخدمين المسندين: <strong className="text-slate-100 font-mono">{r.assigned_users_count || 0}</strong></span>
                <span>الصلاحيات: <strong className="text-[#d4af37] font-mono">{r.permission_ids?.length || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: MODULAR PERMISSION MATRIX */}
      {!loading && activeTab === 'matrix' && (
        <form onSubmit={handleCreateRole} className="space-y-6 bg-[#1b3325]/90 border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#d4af37]/20 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#d4af37]">بناء مصفوفة الصلاحيات وتخصيص الدور الموديلار</h2>
              <p className="text-xs text-slate-300">حدد العمليات القياسية لكل وحدة بناءً على الهيكلية التوسعية</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={selectAllPermissions} className="px-3 py-1.5 bg-[#0f1e16] border border-[#d4af37]/30 text-xs font-bold text-[#d4af37] rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer">
                تحديد الكل
              </button>
              <button type="button" onClick={selectViewOnlyPermissions} className="px-3 py-1.5 bg-[#0f1e16] border border-[#d4af37]/30 text-xs font-bold text-slate-300 rounded-xl hover:text-white transition cursor-pointer">
                صلاحيات عرض فقط
              </button>
              <button type="button" onClick={() => setSelectedPermissions([])} className="px-3 py-1.5 bg-red-950/60 border border-red-800 text-xs font-bold text-red-300 rounded-xl hover:bg-red-800 transition cursor-pointer">
                إلغاء التحديد
              </button>
            </div>
          </div>

          <div className="max-w-md">
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم الدور الجديد (بالعربية) *</label>
            <input
              type="text"
              required
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="مثال: مسؤول حضور وانصراف الفروع"
              className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Dynamic Permission Modules Grid */}
          <div className="space-y-6">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-[#0f1e16]/80 border border-[#d4af37]/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#d4af37]">
                  <span>📦</span>
                  <span>{mod.name_ar}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({mod.code})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {mod.permissions.map((p: any) => (
                    <label key={p.id} className="flex items-center gap-2 p-2.5 bg-[#1b3325]/60 rounded-xl border border-[#d4af37]/10 hover:border-[#d4af37]/40 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                        className="accent-[#d4af37] w-4 h-4 rounded cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-200">{p.name_ar}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#d4af37]/20 flex gap-3">
            <button
              type="submit"
              disabled={savingRole}
              className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {savingRole ? 'جاري حفظ الدور المخصص...' : '💾 حفظ الدور ومصفوفة الصلاحيات الموديلار ←'}
            </button>
          </div>
        </form>
      )}

      {/* USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
          <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
              <h3 className="text-lg font-bold text-[#d4af37]">إضافة مستخدم إداري جديد للشركة</h3>
              <button type="button" onClick={() => setIsUserModalOpen(false)} className="text-slate-400 font-bold hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="ahmed@company.com"
                  className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الأدوار المسندة (Many-to-Many Roles) *</label>
                <div className="space-y-2 max-h-36 overflow-y-auto bg-[#0f1e16] p-3 rounded-xl border border-[#d4af37]/30">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoleIds.includes(r.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoleIds(prev => [...prev, r.id]);
                          } else {
                            setSelectedRoleIds(prev => prev.filter(id => id !== r.id));
                          }
                        }}
                        className="accent-[#d4af37] w-4 h-4 rounded cursor-pointer"
                      />
                      <span>{r.name_ar}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">نطاق الوصول للبيانات (Data Scope) *</label>
                <select
                  value={userDataScope}
                  onChange={(e) => setUserDataScope(e.target.value)}
                  className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="all_company">🏢 كل المنشأة (All Company)</option>
                  <option value="selected_branches">📍 فروع محددة فقط (Selected Branches)</option>
                  <option value="selected_departments">🏬 أقسام محددة فقط (Selected Departments)</option>
                  <option value="direct_reports">👥 الموظفون التابعون له مباشرة (Direct Reports)</option>
                  <option value="self_only">👤 ملفه الذاتي فقط (Self Only)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#d4af37]/20">
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
                >
                  {savingUser ? 'جاري الإضافة...' : '💾 إضافة المستخدم وتعيين الأدوار ←'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
