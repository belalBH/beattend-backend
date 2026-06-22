import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Monitor, Lock, Key, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Switch } from '../components/Shared';
import { translations } from '../i18n';
import { API_BASE_URL } from '../constants';

export const SettingsView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];

  const [adminName, setAdminName] = useState(lang === 'ar' ? 'أحمد العتيبي' : 'Ahmed Otaibi');
  const [adminEmail, setAdminEmail] = useState('admin@beattend.com');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setStatusMsg('');
    setIsError(false);

    if (!currentPassword && newPassword) {
      setIsError(true);
      setStatusMsg(lang === 'ar' ? 'يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور' : 'Please enter current password to change password');
      return;
    }

    setLoading(true);
    try {
      // If user wants to change password
      if (currentPassword && newPassword) {
        const res = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword: currentPassword, newPassword: newPassword })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg(lang === 'ar' ? 'تم تحديث الإعدادات وكلمة المرور بنجاح' : 'Settings and password updated successfully');
          setCurrentPassword('');
          setNewPassword('');
        } else {
          setIsError(true);
          setStatusMsg(data.message || (lang === 'ar' ? 'فشل تحديث كلمة المرور' : 'Failed to update password'));
        }
      } else {
        // Just mock profile update
        setStatusMsg(lang === 'ar' ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
      }
    } catch (e) {
      console.error("Settings update error:", e);
      setIsError(true);
      setStatusMsg(lang === 'ar' ? 'تعذر الاتصال بالخادم' : 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700 pb-10">
      <div className="flex items-center gap-6">
        <div className="bg-[#15385E] p-5 rounded-[2rem] text-white shadow-md"><SettingsIcon size={36} className="text-[#17AE9F]" /></div>
        <div>
            <h2 className="text-xl font-black text-gray-900">{lang === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">System Configuration & User Preferences</p>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border ${
          isError ? 'bg-red-50 text-red-500 border-red-100' : 'bg-[#E8F7F5] text-[#17AE9F] border-[#17AE9F]/10'
        } animate-in fade-in duration-300`}>
          {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100/70 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#15385E]">{t.personal_acc}</h3>
              <User className="text-[#17AE9F]" size={20} />
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img src="https://ui-avatars.com/api/?name=Admin&background=15385E&color=fff" className="w-28 h-28 rounded-[2.5rem] shadow-md border-2 border-white" />
                <div className={`absolute -bottom-2 ${lang === 'ar' ? '-left-2' : '-right-2'} bg-[#17AE9F] text-white p-2 rounded-xl border-4 border-white shadow-sm`}>
                  <Edit2 size={12} />
                </div>
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900">{lang === 'ar' ? 'أحمد العتيبي' : 'Ahmed Otaibi'}</h4>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Super Administrator</p>
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.name}</label>
                <input 
                  className={`w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#17AE9F] focus:bg-white rounded-2xl text-xs font-bold text-gray-900 transition-all ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`} 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.email}</label>
                <input 
                  className={`w-full px-5 py-3.5 bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#17AE9F] focus:bg-white rounded-2xl text-xs font-bold text-gray-900 transition-all ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`} 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
            </div>
        </div>

        {/* System Settings & Change Password */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100/70 shadow-sm lg:col-span-2 space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#15385E]">{t.system_pref}</h3>
              <Monitor className="text-[#17AE9F]" size={20} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                  <div className="flex items-center justify-between group cursor-pointer p-4 hover:bg-[#E8F7F5]/20 rounded-2xl transition-all">
                    <div>
                      <p className="font-bold text-xs text-gray-900">{t.notifications}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'ar' ? 'تنبيهات فورية عند التبصيم' : 'Real-time attendance alerts'}</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between group cursor-pointer p-4 hover:bg-[#E8F7F5]/20 rounded-2xl transition-all">
                    <div>
                      <p className="font-bold text-xs text-gray-900">{t.security_2fa}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{lang === 'ar' ? 'تأمين الدخول عبر الهاتف' : 'Secure login via phone'}</p>
                    </div>
                    <Switch checked={false} />
                  </div>
              </div>
              
              <div className={`space-y-6 ${lang === 'ar' ? 'border-r' : 'border-l'} border-gray-55 ${lang === 'ar' ? 'pr-10' : 'pl-10'}`}>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-[#15385E] border-b border-gray-50 pb-2">{t.change_password}</h4>
                    <div className="relative">
                      <Lock className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-3.5 text-gray-300`} size={14} />
                      <input 
                        type="password" 
                        placeholder={lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'} 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3.5 bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#17AE9F] focus:bg-white rounded-2xl text-xs font-bold transition-all`} 
                      />
                    </div>
                    <div className="relative">
                      <Key className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-3.5 text-gray-300`} size={14} />
                      <input 
                        type="password" 
                        placeholder={lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3.5 bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#17AE9F] focus:bg-white rounded-2xl text-xs font-bold transition-all`} 
                      />
                    </div>
                  </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-50 flex justify-end">
              <div className="flex gap-3">
                  <button 
                    onClick={() => { setCurrentPassword(''); setNewPassword(''); setStatusMsg(''); }} 
                    className="bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold text-xs transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-[#15385E] text-white hover:bg-[#17AE9F] px-8 py-3 rounded-2xl font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                  >
                    {loading ? (lang === 'ar' ? 'جاري التحديث...' : 'Updating...') : t.update}
                  </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
