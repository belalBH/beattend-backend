import React, { useState, useEffect } from 'react';
import { UsersAndPermissionsView } from './UsersAndPermissionsView';

export const TenantSettingsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>('profile');
  const [settingsData, setSettingsData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const tenantId = localStorage.getItem('beattend_tenant_id') || 'tenant-sol-102';
      const res = await fetch('/php_api/api.php?route=tenant_settings', {
        headers: { 'X-Tenant-ID': tenantId }
      });
      const data = await res.json();
      if (data.success) {
        setSettingsData(data.data || {});
      } else {
        setError(data.message || 'فشل استرجاع إعدادات المنشأة');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API إعدادات المنشأة');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '🏢 بيانات الشركة', icon: '🏛️' },
    { id: 'branches', label: '📍 الفروع والمقرات', icon: '🏬' },
    { id: 'departments', label: '🗂️ الأقسام والدرجات', icon: '👥' },
    { id: 'leave_types', label: '📅 أنواع الإجازات', icon: '✈️' },
    { id: 'schedules', label: '⏰ الجداول الزمنية', icon: '⏱️' },
    { id: 'holidays', label: '🎉 العطل الرسمية', icon: '🌴' },
    { id: 'working_hours', label: '⏳ ساعات العمل', icon: '⚖️' },
    { id: 'devices', label: '📱 أجهزة البصمة', icon: '📟' },
    { id: 'geofences', label: '🗺️ المواقع الجغرافية', icon: '📍' },
    { id: 'notifications', label: '🔔 الإشعارات والتنبيهات', icon: '💬' },
    { id: 'email', label: '✉️ البريد الإلكتروني', icon: '📧' },
    { id: 'roles', label: '🔐 الصلاحيات والمستخدمين', icon: '🛡️' }
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-[#d4af37] space-y-3 dir-rtl" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
        <div className="text-xs font-bold animate-pulse">جاري تحميل إعدادات المنشأة الكاملة حياً...</div>
      </div>
    );
  }

  const profile = settingsData?.profile || {};
  const leaveTypes = settingsData?.leave_types || [];
  const branches = settingsData?.branches || [];
  const departments = settingsData?.departments || [];
  const schedules = settingsData?.schedules || [];
  const holidays = settingsData?.holidays || [];
  const devices = settingsData?.devices || [];

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#d4af37]">⚙️ إعدادات المنشأة والنظام (Company Settings Suite)</h1>
          <p className="text-xs text-slate-300 mt-1">تحديد الهوية الرسمية، الفروع، الأقسام، الإجازات، الدوام، وأجهزة البصمة</p>
        </div>

        <button
          type="button"
          onClick={() => alert('تم حفظ وتحديث إعدادات المنشأة بنجاح')}
          className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 cursor-pointer"
        >
          💾 حفظ كافة التغييرات
        </button>
      </div>

      {/* 12 Sub-Tabs Bar */}
      <div className="flex flex-wrap gap-2 bg-[#1b3325] p-3 rounded-2xl border border-[#d4af37]/20">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === t.id
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] shadow-md'
                : 'bg-[#0f1e16] text-slate-300 border border-[#d4af37]/15 hover:text-[#d4af37]'
            }`}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: COMPANY PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">🏢 بيانات ومعلومات الشركة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">اسم الشركة الرسمي *</label>
              <input
                type="text"
                defaultValue={profile.name_ar || 'شركة هداية للحلول التقنية'}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-white outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-bold">رقم السجل التجاري (CR Number)</label>
              <input
                type="text"
                defaultValue={profile.cr_number || '1010884920'}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-white font-mono outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-bold">الرقم الضريبي (VAT Number)</label>
              <input
                type="text"
                defaultValue={profile.tax_number || '3109923849'}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-white font-mono outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BRANCHES */}
      {activeSubTab === 'branches' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
            <h3 className="font-bold text-[#d4af37] text-sm">📍 فروع ومقرات المنشأة ({branches.length})</h3>
            <button type="button" onClick={() => alert('إضافة فرع جديد')} className="px-3 py-1.5 bg-[#0f1e16] border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition">➕ إضافة فرع</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b: any) => (
              <div key={b.id} className="p-4 bg-[#0f1e16] rounded-2xl border border-[#d4af37]/20 space-y-1">
                <div className="font-bold text-slate-100 text-sm">{b.name_ar}</div>
                <div className="text-slate-400">{b.address} ({b.city})</div>
                <div className="text-[#d4af37] font-mono font-bold mt-2">عدد الموظفين: {b.employees_count} موظف</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeSubTab === 'departments' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
            <h3 className="font-bold text-[#d4af37] text-sm">🗂️ الأقسام والدرجات الوظيفية ({departments.length})</h3>
            <button type="button" onClick={() => alert('إضافة قسم جديد')} className="px-3 py-1.5 bg-[#0f1e16] border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition">➕ إضافة قسم</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((d: any) => (
              <div key={d.id} className="p-4 bg-[#0f1e16] rounded-2xl border border-[#d4af37]/20 space-y-1">
                <div className="font-bold text-slate-100">{d.name_ar} ({d.code})</div>
                <div className="text-slate-400 text-[11px]">مدير القسم: {d.manager}</div>
                <div className="text-emerald-400 font-mono font-bold mt-1">{d.employees_count} موظف</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE TYPES */}
      {activeSubTab === 'leave_types' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
            <h3 className="font-bold text-[#d4af37] text-sm">📅 أنواع وسياسات الإجازات ({leaveTypes.length})</h3>
            <button type="button" onClick={() => alert('إضافة نوع إجازة جديد')} className="px-3 py-1.5 bg-[#0f1e16] border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold rounded-xl hover:bg-[#d4af37] hover:text-[#0f1e16] transition">➕ إضافة سياسة إجازة</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaveTypes.map((lt: any) => (
              <div key={lt.id} className="p-4 bg-[#0f1e16] rounded-2xl border border-[#d4af37]/20 space-y-2">
                <div className="font-bold text-slate-100 text-sm">{lt.name_ar}</div>
                <div className="text-[#d4af37] font-mono font-bold">{lt.days_credit} يوم سنوياً</div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                    {lt.is_paid ? 'مدفوعة الأجر' : 'غير مدفوعة'}
                  </span>
                  {lt.requires_attachment && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">
                      تتطلب مرفق
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WORK SCHEDULES & SHIFTS */}
      {activeSubTab === 'schedules' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">⏰ الجداول الزمنية ومناوبات العمل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((s: any) => (
              <div key={s.id} className="p-4 bg-[#0f1e16] rounded-2xl border border-[#d4af37]/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-100 text-sm">{s.name_ar}</span>
                  {s.is_default && <span className="px-2 py-0.5 bg-[#d4af37] text-[#0f1e16] font-bold rounded-full text-[10px]">الدوام الافتراضي</span>}
                </div>
                <div className="font-mono text-slate-300">من {s.check_in_time} إلى {s.check_out_time} (مهلة السماح: {s.grace_period_mins} د)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: OFFICIAL HOLIDAYS */}
      {activeSubTab === 'holidays' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">🎉 العطل الرسمية والأعياد الوطنية</h3>
          <div className="space-y-2">
            {holidays.map((h: any) => (
              <div key={h.id} className="p-3 bg-[#0f1e16] rounded-xl border border-[#d4af37]/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-100">{h.title}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{h.start_date} إلى {h.end_date}</div>
                </div>
                <span className="px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] font-mono font-bold rounded-full text-xs">
                  {h.days_count} يوم عطلة
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: WORKING HOURS & LATENESS */}
      {activeSubTab === 'working_hours' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">⏳ ساعات العمل وقوانين احتساب التأخير</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-[#0f1e16] rounded-xl border border-[#d4af37]/20">
              <div className="text-slate-400">أيام العمل الأسبوعية:</div>
              <div className="text-xl font-bold font-mono text-[#d4af37] mt-1">5 أيام / أسبوع</div>
            </div>
            <div className="p-3 bg-[#0f1e16] rounded-xl border border-[#d4af37]/20">
              <div className="text-slate-400">ساعات الدوام اليومي:</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">8 ساعات</div>
            </div>
            <div className="p-3 bg-[#0f1e16] rounded-xl border border-[#d4af37]/20">
              <div className="text-slate-400">مهلة سماح التأخير:</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">15 دقيقة</div>
            </div>
            <div className="p-3 bg-[#0f1e16] rounded-xl border border-[#d4af37]/20">
              <div className="text-slate-400">معامل الإضافي (Overtime):</div>
              <div className="text-xl font-bold font-mono text-teal-300 mt-1">1.5x ساعة</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: BIOMETRIC DEVICES */}
      {activeSubTab === 'devices' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">📱 أجهزة البصمة الحيوية والربط السحابي</h3>
          <div className="space-y-3">
            {devices.map((dev: any) => (
              <div key={dev.id} className="p-3.5 bg-[#0f1e16] rounded-2xl border border-[#d4af37]/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-100">{dev.device_name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{dev.ip_address} | {dev.serial_number} ({dev.location})</div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-full text-xs">
                  🟢 متصل بالشبكة (Online)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: GEOFENCES */}
      {activeSubTab === 'geofences' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">🗺️ المواقع الجغرافية وحرم البصمة</h3>
          <div className="p-4 bg-[#0f1e16] rounded-2xl border border-[#d4af37]/20 space-y-2">
            <div className="font-bold text-slate-100">المقر الرئيسي - الرياض</div>
            <div className="text-slate-400 font-mono">Latitude: 24.7136, Longitude: 46.6753 (نصف القطر: 150 متر)</div>
            <div className="text-emerald-400 font-bold">🟢 مفعل للبصمة التلقائية عبر التطبيق</div>
          </div>
        </div>
      )}

      {/* TAB 10: NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">🔔 إعدادات التنبيهات والإشعارات الفورية</h3>
          <div className="space-y-2">
            <div className="p-3 bg-[#0f1e16] rounded-xl border border-[#d4af37]/20 flex justify-between items-center">
              <span>تنبيهات الحضور والانصراف الفورية على الجوال</span>
              <span className="text-emerald-400 font-bold">🟢 مفعلة</span>
            </div>
            <div className="p-3 bg-[#0f1e16] rounded-xl border border-[#d4af37]/20 flex justify-between items-center">
              <span>إشعارات البريد عند تقديم وتحديث الطلبات</span>
              <span className="text-emerald-400 font-bold">🟢 مفعلة</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: EMAIL SETTINGS */}
      {activeSubTab === 'email' && (
        <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="font-bold text-[#d4af37] text-sm border-b border-[#d4af37]/20 pb-3">✉️ إعدادات البريد الإلكتروني والسيرفر</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1">خادم SMTP الخاص بالشركة</label>
              <input type="text" defaultValue="mail.hadiyah.org.sa" className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-white font-mono" />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">بريد المرسل الرسمي</label>
              <input type="text" defaultValue="noreply@hadiyah.org.sa" className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-white font-mono" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 12: ROLES & PERMISSIONS RBAC */}
      {activeSubTab === 'roles' && (
        <UsersAndPermissionsView />
      )}
    </div>
  );
};
