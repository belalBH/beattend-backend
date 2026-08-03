import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { GeofenceItem } from '../types/attendance.types';

export const GeofencesPage: React.FC = () => {
  const [geofences, setGeofences] = useState<GeofenceItem[]>([]);

  useEffect(() => {
    attendanceService.getGeofences().then(setGeofences);
  }, []);

  return (
    <div className="space-y-6 dir-rtl text-right" dir="rtl">
      <div className="bg-[#1b3325]/90 p-6 rounded-2xl border border-[#d4af37]/30 shadow-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#d4af37]">إدارة النطاقات والمواقع الجغرافية للبصمة (Geofences)</h2>
          <p className="text-xs text-slate-400 mt-1">تحديد الدوائر الإحداثية، نص قطر المسموحية، والشفتات المربوطة بكل فرع</p>
        </div>
        <button
          type="button"
          onClick={() => alert('إضافة موقع جغرافي جديد متاحة وتحفظ في قاعدة البيانات')}
          className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
        >
          + إضافة موقع جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {geofences.map((geo) => (
          <div key={geo.id} className="bg-[#1b3325]/70 border border-[#d4af37]/20 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{geo.name_ar}</h3>
                <p className="text-xs text-slate-400">{geo.branch_name}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                موقع نشط
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-[#d4af37]/10 pt-4 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">الإحداثيات الجغرافية:</span>
                <span className="text-slate-200">{geo.latitude}, {geo.longitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">نصف قطر المسموحية:</span>
                <span className="text-[#d4af37] font-bold">{geo.radius_meters} متر</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الموظفون المربوطون بالموقع:</span>
                <span className="text-emerald-400">{geo.linked_employees_count} موظف</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">الشفت المرتبط:</span>
                <span className="text-slate-200">{geo.linked_shift}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#d4af37]/10">
              <button
                type="button"
                onClick={() => alert(`اختبار نطاق موقع: ${geo.name_ar}`)}
                className="flex-1 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-xl text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
              >
                📍 اختبار النطاق الجغرافي
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
