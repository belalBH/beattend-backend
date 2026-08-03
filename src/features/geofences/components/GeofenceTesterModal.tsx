import React, { useState } from 'react';
import { GeofenceFull, GeofenceTestResult } from '../types/geofence.types';
import { geofenceService } from '../services/geofence.service';

interface Props {
  isOpen: boolean;
  geofence: GeofenceFull | null;
  onClose: () => void;
}

export const GeofenceTesterModal: React.FC<Props> = ({
  isOpen,
  geofence,
  onClose
}) => {
  const [userLat, setUserLat] = useState<number>(24.6880);
  const [userLng, setUserLng] = useState<number>(46.7220);
  const [testing, setTesting] = useState<boolean>(false);
  const [result, setResult] = useState<GeofenceTestResult | null>(null);

  if (!isOpen || !geofence) return null;

  const handleRunTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await geofenceService.testRadius(
        userLat,
        userLng,
        geofence.latitude,
        geofence.longitude,
        geofence.radius_meters
      );
      setResult(res);
    } catch {
      // Fallback local Haversine calculation if API is offline
      const R = 6371000;
      const dLat = (geofence.latitude - userLat) * Math.PI / 180;
      const dLng = (geofence.longitude - userLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(geofence.latitude * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = Math.round(R * c);
      const isWithin = dist <= geofence.radius_meters;

      setResult({
        user_latitude: userLat,
        user_longitude: userLng,
        target_latitude: geofence.latitude,
        target_longitude: geofence.longitude,
        allowed_radius_meters: geofence.radius_meters,
        calculated_distance_meters: dist,
        is_within_geofence: isWithin,
        status_ar: isWithin ? 'داخل النطاق الجغرافي المسموح (صحيحة)' : `خارج النطاق الجغرافي (تجاوز بمقدار ${dist - geofence.radius_meters} متر)`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
      <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#d4af37]">🔍 اختبار النطاق الجغرافي والإحداثيات</h2>
            <p className="text-xs text-slate-400">{geofence.name_ar}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 font-bold hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-[#0f1e16] border border-[#d4af37]/20 rounded-2xl space-y-2 font-mono">
            <div className="flex justify-between text-slate-300">
              <span>إحداثيات المركز المطلوب:</span>
              <span className="text-[#d4af37] font-bold">{geofence.latitude}, {geofence.longitude}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>نصف القطر المسموح به:</span>
              <span className="text-emerald-400 font-bold">{geofence.radius_meters} متر</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-200">إدخال إحداثيات بصمة الموظف للاختبار:</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">خط عرض الموظف (User Lat)</label>
                <input
                  type="number"
                  step="any"
                  value={userLat}
                  onChange={(e) => setUserLat(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">خط طول الموظف (User Lng)</label>
                <input
                  type="number"
                  step="any"
                  value={userLng}
                  onChange={(e) => setUserLng(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunTest}
            disabled={testing}
            className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            {testing ? 'جاري حساب المسافة عبر معادلة Haversine...' : '⚡ تشغيل محاكاة اختبار البصمة والنطاق'}
          </button>

          {result && (
            <div className={`p-4 rounded-2xl border ${
              result.is_within_geofence
                ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200'
                : 'bg-red-900/40 border-red-500 text-red-200'
            } space-y-2 font-mono`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">نتيجة الاختبار:</span>
                <span className="font-bold">{result.is_within_geofence ? '✓ مقبولة (Valid)' : '✕ مرفوضة (Out of Range)'}</span>
              </div>
              <p className="text-xs font-sans font-semibold">{result.status_ar}</p>
              <div className="flex justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                <span>المسافة المحسوبة من المركز:</span>
                <span className="font-bold">{result.calculated_distance_meters} متر</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
