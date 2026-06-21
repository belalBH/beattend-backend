import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Target, Plus, Trash2, MapPinned, Save, X, RefreshCw, Navigation } from 'lucide-react';
import { translations } from '../i18n';
import { API_BASE_URL } from '../constants';

declare var google: any;

interface OfficeLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export const AttendanceLocationView = ({ isDarkMode, lang }: { isDarkMode: boolean, lang: 'ar' | 'en' }) => {
  const t = translations[lang];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const circleInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formName, setFormName] = useState('');
  const [formLat, setFormLat] = useState('24.7136');
  const [formLng, setFormLng] = useState('46.6753');
  const [formRadius, setFormRadius] = useState<number>(100);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/office-locations`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          lat: parseFloat(item.latitude ?? item.lat ?? 24.7136),
          lng: parseFloat(item.longitude ?? item.lng ?? 46.6753),
          radius: parseInt(item.radius_meters ?? item.radius ?? 100),
        }));
        setLocations(mapped);
        if (mapped.length > 0) {
          setSelectedLocationId(mapped[0].id);
        } else {
          setSelectedLocationId(null);
        }
      }
    } catch (e) {
      console.error("Error fetching locations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && typeof google !== 'undefined') {
      if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 24.7136, lng: 46.6753 },
          zoom: 15,
          disableDefaultUI: false,
          styles: isDarkMode ? darkMapStyle : lightMapStyle,
        });

        // Click handler to pick coordinates
        mapInstance.current.addListener('click', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setFormLat(lat.toFixed(6));
          setFormLng(lng.toFixed(6));
        });
      } else {
        mapInstance.current.setOptions({ styles: isDarkMode ? darkMapStyle : lightMapStyle });
      }
    }
  }, [isDarkMode, locations]);

  // Load selected location into form
  useEffect(() => {
    if (selectedLocationId && !isAdding) {
      const activeLoc = locations.find(l => l.id === selectedLocationId);
      if (activeLoc) {
        setFormName(activeLoc.name);
        setFormLat(activeLoc.lat.toString());
        setFormLng(activeLoc.lng.toString());
        setFormRadius(activeLoc.radius);
      }
    }
  }, [selectedLocationId, isAdding, locations]);

  // Update Map Marker and Circle when form coordinates/radius change
  useEffect(() => {
    if (mapInstance.current) {
      const latVal = parseFloat(formLat);
      const lngVal = parseFloat(formLng);
      const radVal = formRadius;

      if (!isNaN(latVal) && !isNaN(lngVal)) {
        const pos = { lat: latVal, lng: lngVal };

        if (markerInstance.current) {
          markerInstance.current.setPosition(pos);
        } else if (typeof google !== 'undefined') {
          markerInstance.current = new google.maps.Marker({
            position: pos,
            map: mapInstance.current,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          });
        }

        if (circleInstance.current) {
          circleInstance.current.setCenter(pos);
          circleInstance.current.setRadius(radVal);
        } else if (typeof google !== 'undefined') {
          circleInstance.current = new google.maps.Circle({
            strokeColor: "#17AE9F",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#17AE9F",
            fillOpacity: 0.2,
            map: mapInstance.current,
            center: pos,
            radius: radVal
          });
        }

        mapInstance.current.panTo(pos);
      }
    }
  }, [formLat, formLng, formRadius]);

  const handleSelectLocation = (id: string) => {
    setIsAdding(false);
    setSelectedLocationId(id);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setSelectedLocationId(null);
    setFormName(lang === 'ar' ? 'فرع جديد' : 'New Branch');
    if (mapInstance.current) {
      const center = mapInstance.current.getCenter();
      setFormLat(center.lat().toFixed(6));
      setFormLng(center.lng().toFixed(6));
    } else {
      setFormLat('24.7136');
      setFormLng('46.6753');
    }
    setFormRadius(100);
  };

  const handleCancel = () => {
    setIsAdding(false);
    if (locations.length > 0) {
      setSelectedLocationId(locations[0].id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLat || !formLng || !formRadius) return;

    setSaving(true);
    const body = {
      name: formName,
      latitude: parseFloat(formLat),
      longitude: parseFloat(formLng),
      radius_meters: parseInt(formRadius.toString())
    };

    try {
      if (isAdding) {
        // Create new location
        const res = await fetch(`${API_BASE_URL}/api/office-locations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const newLoc = await res.json();
          const mappedNew = {
            id: newLoc.id,
            name: newLoc.name,
            lat: parseFloat(newLoc.latitude),
            lng: parseFloat(newLoc.longitude),
            radius: parseInt(newLoc.radius_meters)
          };
          setLocations(prev => [...prev, mappedNew]);
          setSelectedLocationId(mappedNew.id);
          setIsAdding(false);
        }
      } else if (selectedLocationId) {
        // Update existing location
        const res = await fetch(`${API_BASE_URL}/api/office-locations/${selectedLocationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updatedLoc = await res.json();
          setLocations(prev => prev.map(loc => loc.id === selectedLocationId ? {
            id: updatedLoc.id,
            name: updatedLoc.name,
            lat: parseFloat(updatedLoc.latitude),
            lng: parseFloat(updatedLoc.longitude),
            radius: parseInt(updatedLoc.radius_meters)
          } : loc));
        }
      }
    } catch (e) {
      console.error("Error saving location:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الموقع؟' : 'Are you sure you want to delete this location?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/office-locations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const updated = locations.filter(l => l.id !== id);
        setLocations(updated);
        if (selectedLocationId === id) {
          if (updated.length > 0) {
            setSelectedLocationId(updated[0].id);
          } else {
            setSelectedLocationId(null);
          }
        }
      }
    } catch (e) {
      console.error("Error deleting location:", e);
    }
  };

  // Get User's Current Location via GPS
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormLat(position.coords.latitude.toFixed(6));
          setFormLng(position.coords.longitude.toFixed(6));
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          alert(lang === 'ar' ? 'عذراً، فشل تحديد موقعك الجغرافي. تأكد من تفعيل الـ GPS وصلاحيات الموقع.' : 'Failed to retrieve your location. Make sure GPS and location permissions are enabled.');
        }
      );
    } else {
      alert(lang === 'ar' ? 'مستعرض الويب الخاص بك لا يدعم تحديد الموقع الجغرافي.' : 'Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100/70 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'ar' ? 'إدارة الفروع والمواقع الجغرافية' : 'Manage Branches & Locations'}
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            {lang === 'ar' ? 'تحديد فروع الشركة، وتعديل إحداثيات الـ GPS ونطاق السماح بالبصمة (الجيوفنس)' : 'Define company branches, edit GPS coordinates, and set geofencing ranges.'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={fetchLocations}
            className="flex items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-500 transition-all animate-none active:animate-spin"
            title={lang === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={handleStartAdd} 
            className="bg-[#15385E] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 hover:bg-[#17AE9F] transition-all"
          >
            <Plus size={16} /> 
            {lang === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Branch List Card */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100/70 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-[#15385E] uppercase tracking-wider border-b border-gray-50 pb-3 flex justify-between items-center">
              <span>{lang === 'ar' ? 'الفروع المسجلة' : 'Registered Branches'}</span>
              <span className="bg-[#E8F7F5] text-[#17AE9F] px-2 py-0.5 rounded-full text-[9px] font-bold">
                {locations.length} {lang === 'ar' ? 'فروع' : 'branches'}
              </span>
            </h3>

            {loading ? (
              <div className="text-center py-10 text-xs text-gray-400">
                {lang === 'ar' ? 'جاري تحميل المواقع...' : 'Loading locations...'}
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                {lang === 'ar' ? 'لا توجد فروع مسجلة حالياً' : 'No registered branches yet.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar animate-in fade-in duration-300">
                {locations.map(loc => (
                  <div 
                    key={loc.id} 
                    onClick={() => handleSelectLocation(loc.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      selectedLocationId === loc.id && !isAdding
                        ? 'bg-[#E8F7F5] border-[#17AE9F]/30 text-[#15385E] shadow-sm' 
                        : 'bg-gray-50/50 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        selectedLocationId === loc.id && !isAdding ? 'bg-white text-[#17AE9F]' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <MapPin size={15} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate">{loc.name}</span>
                        <span className="text-[9px] text-gray-400 mt-0.5 font-mono">
                          {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-extrabold bg-white text-[#17AE9F] px-2 py-0.5 rounded border border-[#17AE9F]/10">
                        {loc.radius} {lang === 'ar' ? 'متر' : 'meters'}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }} 
                        className="text-gray-300 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title={lang === 'ar' ? 'حذف الموقع' : 'Delete Location'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Editor Card */}
          {(selectedLocationId || isAdding) && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100/70 shadow-sm space-y-5 animate-in slide-in-from-bottom duration-300">
              <h3 className="text-xs font-black text-[#15385E] uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center gap-2">
                <span className="p-1 rounded bg-[#E8F7F5] text-[#17AE9F]"><Target size={12} /></span>
                <span>{isAdding ? (lang === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch') : (lang === 'ar' ? 'تعديل بيانات الفرع' : 'Edit Branch Details')}</span>
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {lang === 'ar' ? 'اسم الفرع / الموقع' : 'Branch / Location Name'}
                  </label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white transition-all"
                    placeholder={lang === 'ar' ? 'مثال: فرع جدة' : 'e.g. Jeddah Branch'}
                  />
                </div>

                {/* GPS Coordinates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">
                      {lang === 'ar' ? 'خط العرض (Latitude)' : 'Latitude'}
                    </label>
                    <input 
                      type="number" 
                      step="0.000001"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">
                      {lang === 'ar' ? 'خط الطول (Longitude)' : 'Longitude'}
                    </label>
                    <input 
                      type="number" 
                      step="0.000001"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#17AE9F] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Get Current Location Button */}
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#17AE9F]/30 hover:bg-[#E8F7F5]/30 text-[#17AE9F] font-bold text-[10px] rounded-xl transition-all"
                >
                  <Navigation size={12} />
                  {lang === 'ar' ? 'تحديد إحداثيات موقعي الحالي' : 'Get Current GPS Location'}
                </button>

                {/* Radius Slider / Input */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <label className="text-gray-400 uppercase">
                      {lang === 'ar' ? 'نطاق الحضور الجغرافي (Geofence)' : 'Geofence Radius'}
                    </label>
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        min="50" 
                        max="2000" 
                        value={formRadius}
                        onChange={(e) => setFormRadius(Math.max(50, parseInt(e.target.value) || 50))}
                        className="w-14 px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-center text-xs font-extrabold text-[#17AE9F] focus:outline-none focus:border-[#17AE9F]"
                      />
                      <span className="text-gray-400">{lang === 'ar' ? 'متر' : 'meters'}</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="2000" 
                    step="25" 
                    value={formRadius} 
                    onChange={(e) => setFormRadius(parseInt(e.target.value))} 
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#17AE9F] transition-all" 
                  />
                  <div className="flex justify-between text-[8px] text-gray-400 font-bold">
                    <span>50 {lang === 'ar' ? 'متر' : 'm'}</span>
                    <span>100 {lang === 'ar' ? 'متر (جدة)' : 'm (Jeddah)'}</span>
                    <span>150 {lang === 'ar' ? 'متر (مكة)' : 'm (Makkah)'}</span>
                    <span>2000 {lang === 'ar' ? 'متر' : 'm'}</span>
                  </div>
                </div>

                {/* Save / Cancel buttons */}
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 py-3 bg-[#17AE9F] text-white rounded-xl text-xs font-black shadow-md hover:bg-[#15385E] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ الموقع' : 'Save Location')}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 rounded-xl text-xs font-bold transition-all"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Hint Box */}
          <div className="bg-[#15385E] p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden text-white space-y-2">
            <MapPinned className="text-[#17AE9F]" size={28} />
            <h4 className="font-black text-sm">{lang === 'ar' ? 'تحديد إحداثيات GPS بالخريطة' : 'Interactive GPS Map'}</h4>
            <p className="text-white/60 text-[9px] font-bold leading-relaxed">
              {lang === 'ar' 
                ? 'يمكنك النقر مباشرة على أي نقطة على الخريطة لتحديث إحداثيات خطوط الطول والعرض تلقائياً في النموذج أعلاه.' 
                : 'You can click anywhere directly on the map to automatically populate and update the Latitude and Longitude coordinates.'}
            </p>
          </div>

        </div>

        {/* Map Panel (8 cols) */}
        <div className="lg:col-span-8 relative">
          <div 
            ref={mapRef} 
            className={`w-full h-[650px] rounded-[3.5rem] border-8 ${isDarkMode ? 'border-gray-800' : 'border-white'} shadow-md overflow-hidden relative`}
          />
        </div>

      </div>
    </div>
  );
};

const lightMapStyle = [
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] },
  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }
];

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#111827" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#111827" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca3af" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#1f2937" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0b1329" }] }
];
