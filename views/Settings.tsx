
import React from 'react';
import { Settings as SettingsIcon, User, Monitor, Lock, Key, Edit2 } from 'lucide-react';
import { Switch } from '../components/Shared';
import { translations } from '../i18n';

export const SettingsView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex items-center gap-6">
        <div className="bg-[#0B2545] p-5 rounded-[2rem] text-white shadow-2xl shadow-emerald-900/20"><SettingsIcon size={36} /></div>
        <div>
            <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'} tracking-tighter`}>{lang === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h2>
            <p className="text-teal-600/60 font-bold mt-1 uppercase text-[10px] tracking-widest">System Configuration & User Preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${isDarkMode ? 'bg-[#0B2545] border-emerald-800' : 'bg-white border-emerald-100'} p-10 rounded-[3.5rem] border shadow-sm space-y-10`}>
            <div className="flex justify-between items-center"><h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{t.personal_acc}</h3><User className="text-teal-600" size={20} /></div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative"><img src="https://ui-avatars.com/api/?name=Admin&background=064e3b&color=fff" className="w-28 h-28 rounded-[2.5rem] shadow-2xl" /><div className={`absolute -bottom-2 ${lang === 'ar' ? '-left-2' : '-right-2'} bg-emerald-600 text-white p-2 rounded-xl border-4 border-white`}><Edit2 size={14} /></div></div>
              <div><h4 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{lang === 'ar' ? 'أحمد المدير' : 'Ahmed Manager'}</h4><p className="text-teal-600/50 text-xs font-bold uppercase">Super Administrator</p></div>
            </div>
            <div className="space-y-4 pt-6 border-t border-emerald-50/10">
              <div className="space-y-1"><label className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{t.name}</label><input className={`w-full px-5 py-4 ${isDarkMode ? 'bg-emerald-950' : 'bg-teal-50'} border-none rounded-2xl text-sm font-bold`} defaultValue={lang === 'ar' ? 'أحمد العتيبي' : 'Ahmed Otaibi'} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{t.email}</label><input className={`w-full px-5 py-4 ${isDarkMode ? 'bg-emerald-950' : 'bg-teal-50'} border-none rounded-2xl text-sm font-bold`} defaultValue="admin@jesr.pro" /></div>
            </div>
        </div>

        <div className={`${isDarkMode ? 'bg-[#0B2545] border-emerald-800' : 'bg-white border-emerald-100'} p-10 rounded-[3.5rem] border shadow-sm lg:col-span-2 space-y-10`}>
            <div className="flex justify-between items-center"><h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{t.system_pref}</h3><Monitor className="text-teal-600" size={20} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                  <div className="flex items-center justify-between group cursor-pointer p-4 hover:bg-teal-50/50 rounded-2xl transition-all">
                    <div><p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{t.notifications}</p><p className="text-[10px] text-teal-600/50 font-bold">{lang === 'ar' ? 'تنبيهات فورية عند التبصيم' : 'Real-time attendance alerts'}</p></div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between group cursor-pointer p-4 hover:bg-teal-50/50 rounded-2xl transition-all">
                    <div><p className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{t.security_2fa}</p><p className="text-[10px] text-teal-600/50 font-bold">{lang === 'ar' ? 'تأمين الدخول عبر الهاتف' : 'Secure login via phone'}</p></div>
                    <Switch checked={false} />
                  </div>
              </div>
              <div className={`space-y-6 ${lang === 'ar' ? 'border-r' : 'border-l'} border-emerald-50/10 ${lang === 'ar' ? 'pr-10' : 'pl-10'}`}>
                  <div className="space-y-4">
                    <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{t.change_password}</h4>
                    <div className="relative"><Lock className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-4 text-teal-600/30`} size={16} /><input type="password" placeholder={lang === 'ar' ? 'الحالية' : 'Current'} className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 ${isDarkMode ? 'bg-emerald-950' : 'bg-teal-50'} border-none rounded-2xl text-xs font-bold`} /></div>
                    <div className="relative"><Key className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-4 text-teal-600/30`} size={16} /><input type="password" placeholder={lang === 'ar' ? 'الجديدة' : 'New'} className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 ${isDarkMode ? 'bg-emerald-950' : 'bg-teal-50'} border-none rounded-2xl text-xs font-bold`} /></div>
                  </div>
              </div>
            </div>
            <div className="pt-8 border-t border-emerald-50/10 flex justify-end">
              <div className="flex gap-4">
                  <button className="bg-teal-50 text-emerald-950 px-8 py-4 rounded-2xl font-black text-xs">{t.cancel}</button>
                  <button className="bg-[#0B2545] text-white px-10 py-4 rounded-2xl font-black text-xs shadow-2xl">{t.update}</button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
