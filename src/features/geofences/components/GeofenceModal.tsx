import React, { useState, useEffect } from 'react';
import { GeofenceFull, GeofenceInput } from '../types/geofence.types';

interface Props {
  isOpen: boolean;
  editingGeofence: GeofenceFull | null;
  onClose: () => void;
  onSave: (data: GeofenceInput) => Promise<void>;
}

export const GeofenceModal: React.FC<Props> = ({
  isOpen,
  editingGeofence,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<GeofenceInput>({
    name_ar: '',
    name_en: '',
    company_id: 1,
    branch_id: 1,
    latitude: 24.6877,
    longitude: 46.7219,
    radius_meters: 150,
    linked_shift_name: 'الشفت الصباحي الأساسي',
    is_active: true
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGeofence) {
      setFormData({
        name_ar: editingGeofence.name_ar,
        name_en: editingGeofence.name_en || editingGeofence.name_ar,
        company_id: editingGeofence.company_id || 1,
        branch_id: editingGeofence.branch_id || 1,
        latitude: editingGeofence.latitude,
        longitude: editingGeofence.longitude,
        radius_meters: editingGeofence.radius_meters || 150,
        linked_shift_name: editingGeofence.linked_shift_name || 'الشفت الصباحي الأساسي',
        is_active: editingGeofence.is_active
      });
    } else {
      setFormData({
        name_ar: '',
        name_en: '',
        company_id: 1,
        branch_id: 1,
        latitude: 24.6877,
        longitude: 46.7219,
        radius_meters: 150,
        linked_shift_name: 'الشفت الصباحي الأساسي',
        is_active: true
      });
    }
  }, [editingGeofence, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar || !formData.latitude || !formData.longitude) {
      setError('اسم الموقع والإحداثيات حقول إجبارية');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل حفظ الموقع الجغرافي');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: roundToSix(pos.coords.latitude),
          longitude: roundToSix(pos.coords.longitude)
        }));
      }, () => {
        alert('تعذر جلب موقعك الحالي عبر GPS المتصفح');
      });
    }
  };

  const roundToSix = (num: number) => Math.round(num * 1000000) / 1000000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
      <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
          <h2 className="text-xl font-bold text-[#d4af37]">
            {editingGeofence ? '✏️ تعديل بيانات الموقع الجغرافي' : '+ إضافة موقع جغرافي جديد'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 font-bold hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم الموقع (بالعربية) *</label>
              <input
                type="text"
                required
                value={formData.name_ar}
                onChange={(e) => setFormData(p => ({ ...p, name_ar: e.target.value }))}
                placeholder="مثال: مقر Fayha Branch الرئيسي"
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم الموقع (بالإنجليزية)</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData(p => ({ ...p, name_en: e.target.value }))}
                placeholder="e.g. Fayha Main HQ"
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">خط العرض (Latitude) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData(p => ({ ...p, latitude: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">خط الطول (Longitude) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData(p => ({ ...p, longitude: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">نصف القطر (بالأمتار) *</label>
              <input
                type="number"
                required
                min="10"
                max="5000"
                value={formData.radius_meters}
                onChange={(e) => setFormData(p => ({ ...p, radius_meters: parseInt(e.target.value) || 150 }))}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#0f1e16] p-3 rounded-xl border border-[#d4af37]/20">
            <span className="text-slate-300 text-xs font-semibold">تحديد الإحداثيات تلقائياً:</span>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="px-3 py-1.5 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-xs font-bold hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
            >
              📍 استخدام موثّق موقعي الحالي عبر GPS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">الشفت المرتبط بالموقع</label>
              <select
                value={formData.linked_shift_name}
                onChange={(e) => setFormData(p => ({ ...p, linked_shift_name: e.target.value }))}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="الشفت الصباحي الأساسي">الشفت الصباحي الأساسي (08:00 ص - 04:30 م)</option>
                <option value="الشفت المسائي والدورية">الشفت المسائي والدورية (04:00 م - 12:00 م)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">حالة تفعيل الموقع</label>
              <select
                value={formData.is_active ? '1' : '0'}
                onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.value === '1' }))}
                className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="1">🟢 نشط ومعتمد للبصمات</option>
                <option value="0">🔴 معطل مؤقتاً</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#d4af37]/20">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              {submitting ? 'جاري الحفظ والربط مع قاعدة البيانات...' : '💾 حفظ البيانات وتأكيد النطاق'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-[#0f1e16] text-slate-300 border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:text-[#d4af37] transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
