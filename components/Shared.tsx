
import React from 'react';
import { LucideIcon } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-xl shadow-emerald-900/5 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
    <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`}></div>
    <div className="flex justify-between items-start">
      <div className={`p-4 rounded-2xl bg-teal-50 text-emerald-900 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">{trend}</span>}
    </div>
    <div className="mt-6">
      <h3 className="text-emerald-900/40 text-[10px] font-black uppercase tracking-widest">{title}</h3>
      <p className="text-4xl font-black mt-2 text-emerald-950 tracking-tight">{value}</p>
    </div>
  </div>
);

export const Switch = ({ checked }: { checked: boolean }) => (
  <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${checked ? 'bg-emerald-600' : 'bg-emerald-100 border border-emerald-200'}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${checked ? 'right-1' : 'right-7'}`}></div>
  </div>
);
