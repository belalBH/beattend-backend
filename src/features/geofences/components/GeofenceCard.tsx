import React from 'react';
import { GeofenceFull } from '../types/geofence.types';

interface Props {
  geofence: GeofenceFull;
  onEdit: (geo: GeofenceFull) => void;
  onDelete: (geo: GeofenceFull) => void;
  onTestRadius: (geo: GeofenceFull) => void;
  onLinkEmployees: (geo: GeofenceFull) => void;
}

export const GeofenceCard: React.FC<Props> = ({
  geofence,
  onEdit,
  onDelete,
  onTestRadius,
  onLinkEmployees
}) => {
  return (
    <div className="bg-[#1b3325]/80 border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4 text-right dir-rtl" dir="rtl">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h3 className="text-lg font-bold text-slate-100">{geofence.name_ar}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{geofence.company_name || 'شركة الحلول المتقدمة'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          geofence.is_active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
        }`}>
          {geofence.is_active ? '✓ موقع نشط' : '✕ غير مفعّل'}
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-300 border-t border-[#d4af37]/10 pt-4 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">الإحداثيات (Lat, Lng):</span>
          <span className="text-slate-100 font-bold">{geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">نصف قطر المسموحية:</span>
          <span className="text-[#d4af37] font-bold">{geofence.radius_meters} متر</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">الموظفون المربوطون:</span>
          <button
            type="button"
            onClick={() => onLinkEmployees(geofence)}
            className="text-emerald-400 underline font-bold hover:text-emerald-300 cursor-pointer"
          >
            👥 {geofence.linked_employees_count} موظف (ربط/تعديل)
          </button>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">الشفت المرتبط:</span>
          <span className="text-slate-200">{geofence.linked_shift_name || 'الشفت الصباحي الأساسي'}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#d4af37]/10">
        <button
          type="button"
          onClick={() => onTestRadius(geofence)}
          className="py-2 px-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer text-center"
        >
          🔍 اختبار النطاق
        </button>
        <button
          type="button"
          onClick={() => onEdit(geofence)}
          className="py-2 px-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer text-center"
        >
          ✏️ تعديل
        </button>
        <button
          type="button"
          onClick={() => onDelete(geofence)}
          className="py-2 px-2 bg-red-900/40 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition cursor-pointer text-center"
        >
          🗑️ حذف
        </button>
      </div>
    </div>
  );
};
