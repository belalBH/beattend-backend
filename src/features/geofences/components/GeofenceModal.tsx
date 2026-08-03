import React, { useState, useEffect, useRef } from 'react';
import { GeofenceFull, GeofenceInput } from '../types/geofence.types';

declare const L: any;

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [mapTileMode, setMapTileMode] = useState<'streets' | 'satellite'>('streets');
  const [locating, setLocating] = useState<boolean>(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

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

  // Initialize and update Google Maps Leaflet Layer
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (typeof L === 'undefined') return;

      const initialLat = formData.latitude || 24.6877;
      const initialLng = formData.longitude || 46.7219;

      if (!mapRef.current) {
        // Create Map Instance
        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 16);
        mapRef.current = map;

        // OFFICIAL GOOGLE MAPS TILES LAYER
        const googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '© Google Maps'
        });
        googleStreets.addTo(map);

        // Marker & Circle
        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        const circle = L.circle([initialLat, initialLng], {
          radius: formData.radius_meters || 150,
          color: '#d4af37',
          fillColor: '#d4af37',
          fillOpacity: 0.25,
          weight: 3
        }).addTo(map);
        circleRef.current = circle;

        // Dragging Marker Update Event
        marker.on('dragend', (e: any) => {
          const latLng = e.target.getLatLng();
          const newLat = roundToSix(latLng.lat);
          const newLng = roundToSix(latLng.lng);
          setFormData(prev => ({ ...prev, latitude: newLat, longitude: newLng }));
        });

        // Clicking on Map to Move Marker Event
        map.on('click', (e: any) => {
          const newLat = roundToSix(e.latlng.lat);
          const newLng = roundToSix(e.latlng.lng);
          setFormData(prev => ({ ...prev, latitude: newLat, longitude: newLng }));
        });
      } else {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Sync Map Marker & Circle with Form Data Changes
  useEffect(() => {
    if (mapRef.current && markerRef.current && circleRef.current) {
      const lat = formData.latitude;
      const lng = formData.longitude;
      const rad = formData.radius_meters;

      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(rad);

      mapRef.current.panTo([lat, lng]);
    }
  }, [formData.latitude, formData.longitude, formData.radius_meters]);

  if (!isOpen) return null;

  const roundToSix = (num: number) => Math.round(num * 1000000) / 1000000;

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
    if (!navigator.geolocation) {
      alert('متصفحك لا يدعم خاصية تحديد الموقع الجغرافي GPS');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = roundToSix(pos.coords.latitude);
        const lng = roundToSix(pos.coords.longitude);
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 18);
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        alert('تعذر جلب موقعك الحالي: يرجى السماح للمتصفح بالوصول لموقعك الجغرافي GPS');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = roundToSix(parseFloat(data[0].lat));
        const lng = roundToSix(parseFloat(data[0].lon));
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
        }
      } else {
        alert('لم يتم العثور على موقع بهذا الاسم في Google Maps');
      }
    } catch (err) {
      alert('حدث خطأ أثناء البحث عن الموقع');
    } finally {
      setSearching(false);
    }
  };

  const toggleTileMode = () => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });

    if (mapTileMode === 'streets') {
      // Switch to GOOGLE MAPS HYBRID SATELLITE
      L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps Satellite'
      }).addTo(mapRef.current);
      setMapTileMode('satellite');
    } else {
      // Switch to GOOGLE MAPS STREETS
      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
      }).addTo(mapRef.current);
      setMapTileMode('streets');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
      <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗺️</span>
            <div>
              <h2 className="text-xl font-bold text-[#d4af37]">
                {editingGeofence ? '✏️ تعديل وتضخيم النطاق (Google Maps)' : '+ تحديد ونطاق جغرافي جديد (Google Maps)'}
              </h2>
              <p className="text-xs text-slate-400">خرائط جوجل المباشرة Google Maps: اسحب الدبوس أو انقر لتعديل الموقع والدائرة</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 font-bold hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-200">
          {/* Geofence Name inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم الموقع / النطاق الجغرافي (بالعربية) *</label>
              <input
                type="text"
                required
                value={formData.name_ar}
                onChange={(e) => setFormData(p => ({ ...p, name_ar: e.target.value }))}
                placeholder="مثال: مقر شركة هداية الرئيسي - طريق الملك فهد"
                className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">اسم الموقع (بالإنجليزية)</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData(p => ({ ...p, name_en: e.target.value }))}
                placeholder="e.g. Hadiyah Main HQ Branch"
                className="w-full p-3 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Interactive Google Maps Search & Tiles Bar */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
              {/* Address Search Form */}
              <div className="flex-1 flex gap-2 w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن اسم مدينة، حي أو معلم في Google Maps..."
                  className="flex-1 px-3 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={searching}
                  className="px-4 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                >
                  {searching ? 'جاري البحث...' : '🔍 بحث Google Maps'}
                </button>
              </div>

              {/* Map View Toggle & My Location Buttons */}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={toggleTileMode}
                  className="px-3 py-2 bg-[#0f1e16] text-slate-200 border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:text-[#d4af37] transition cursor-pointer"
                >
                  {mapTileMode === 'streets' ? '🛰️ قمر صناعي Google' : '🗺️ شوارع Google'}
                </button>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locating}
                  className="px-3 py-2 bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 font-bold rounded-xl text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer disabled:opacity-50"
                >
                  {locating ? '⏳ جاري تحديد موقعك...' : '📍 موقعي الحقيقي (GPS)'}
                </button>
              </div>
            </div>

            {/* Interactive Google Maps Canvas Container */}
            <div className="relative w-full h-72 rounded-2xl border-2 border-[#d4af37]/40 overflow-hidden shadow-inner bg-[#0f1e16]">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              <div className="absolute top-3 right-3 bg-[#0f1e16]/90 border border-[#d4af37]/40 px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#d4af37] z-[400] shadow-md backdrop-blur-md flex items-center gap-1.5">
                <span>🗺️</span>
                <span>خرائط جوجل المباشرة (Google Maps) - اسحب الدبوس للتعديل</span>
              </div>
            </div>
          </div>

          {/* Dynamic Radius & Coordinates Interactive Controls */}
          <div className="p-4 bg-[#0f1e16]/80 border border-[#d4af37]/30 rounded-2xl space-y-4">
            {/* Radius Range Slider & Presets */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-200">
                  🎯 نصف قطر النطاق المسموح (Radius): <span className="text-[#d4af37] font-mono text-sm">{formData.radius_meters} متر</span>
                </label>
                <span className="text-[11px] text-slate-400">تكبير أو تصغير الدائرة على خريطة جوجل</span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="20"
                max="2000"
                step="10"
                value={formData.radius_meters}
                onChange={(e) => setFormData(p => ({ ...p, radius_meters: parseInt(e.target.value) || 150 }))}
                className="w-full h-2 bg-[#1b3325] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />

              {/* Quick Preset Radius Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-slate-400 self-center">أبعاد سريعة:</span>
                {[50, 100, 150, 250, 500, 1000].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, radius_meters: r }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                      formData.radius_meters === r
                        ? 'bg-[#d4af37] text-[#0f1e16] shadow-md'
                        : 'bg-[#1b3325] text-slate-300 border border-[#d4af37]/20 hover:border-[#d4af37]'
                    }`}
                  >
                    {r}م
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates Real-time Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#d4af37]/15">
              <div>
                <label className="block text-slate-400 font-medium mb-1">خط العرض (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData(p => ({ ...p, latitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2.5 bg-[#1b3325] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">خط الطول (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData(p => ({ ...p, longitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2.5 bg-[#1b3325] border border-[#d4af37]/30 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">الشفت المرتبط</label>
                <select
                  value={formData.linked_shift_name}
                  onChange={(e) => setFormData(p => ({ ...p, linked_shift_name: e.target.value }))}
                  className="w-full p-2.5 bg-[#1b3325] border border-[#d4af37]/30 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="الشفت الصباحي الأساسي">الشفت الصباحي الأساسي</option>
                  <option value="الشفت المسائي والدورية">الشفت المسائي والدورية</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#d4af37]/20">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ والربط مع قاعده Staging DB...' : '💾 حفظ النطاق الجغرافي وتأكيد الإحداثيات ←'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-[#0f1e16] text-slate-300 border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:text-[#d4af37] transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
