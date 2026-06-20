
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Target, Plus, Trash2, MapPinned, PlusCircle } from 'lucide-react';
import { translations } from '../i18n';

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

  const [locations, setLocations] = useState<OfficeLocation[]>([
    { id: '1', name: lang === 'ar' ? 'الفرع الرئيسي - الرياض' : 'Main Branch - Riyadh', lat: 24.7136, lng: 46.6753, radius: 300 },
    { id: '2', name: lang === 'ar' ? 'فرع جدة - الكورنيش' : 'Jeddah Branch - Corniche', lat: 21.4858, lng: 39.1925, radius: 500 },
  ]);

  const [selectedLocationId, setSelectedLocationId] = useState<string>('1');
  const activeLocation = locations.find(l => l.id === selectedLocationId) || locations[0];

  useEffect(() => {
    if (mapRef.current && typeof google !== 'undefined') {
      if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: activeLocation.lat, lng: activeLocation.lng },
          zoom: 15,
          disableDefaultUI: true,
          styles: isDarkMode ? darkMapStyle : lightMapStyle,
        });
        mapInstance.current.addListener('click', (e: any) => {
          addNewLocation(e.latLng.lat(), e.latLng.lng());
        });
      }
    }
  }, [isDarkMode]);

  const addNewLocation = (lat?: number, lng?: number) => {
    const center = mapInstance.current ? mapInstance.current.getCenter() : { lat: 24.7136, lng: 46.6753 };
    const newLoc: OfficeLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: lang === 'ar' ? `فرع جديد #${locations.length + 1}` : `New Branch #${locations.length + 1}`,
      lat: lat ?? center.lat(),
      lng: lng ?? center.lng(),
      radius: 300
    };
    setLocations(prev => [...prev, newLoc]);
    setSelectedLocationId(newLoc.id);
  };

  useEffect(() => {
    if (mapInstance.current && activeLocation) {
      const pos = { lat: activeLocation.lat, lng: activeLocation.lng };
      if (markerInstance.current) markerInstance.current.setPosition(pos);
      else markerInstance.current = new google.maps.Marker({ position: pos, map: mapInstance.current, icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' } });
      if (circleInstance.current) { circleInstance.current.setCenter(pos); circleInstance.current.setRadius(activeLocation.radius); }
      else circleInstance.current = new google.maps.Circle({ strokeColor: "#17AE9F", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#17AE9F", fillOpacity: 0.2, map: mapInstance.current, center: pos, radius: activeLocation.radius });
      mapInstance.current.panTo(pos);
    }
  }, [selectedLocationId, activeLocation?.radius]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'} tracking-tighter`}>{t.geofence_mgmt}</h2>
          <p className="text-teal-600/60 font-bold mt-1 uppercase text-[10px] tracking-widest">{t.geofence_sub}</p>
        </div>
        <button onClick={() => addNewLocation()} className="bg-[#0B2545] text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center gap-3 hover:bg-emerald-800 transition-all"><Plus size={18} /> {t.add_branch}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className={`${isDarkMode ? 'bg-[#0B2545] border-emerald-800' : 'bg-white border-emerald-100'} p-6 rounded-[2.5rem] border shadow-sm space-y-6`}>
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-teal-600"><Target size={20} /></div>
              <h3 className={`font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>{lang === 'ar' ? 'إعدادات النطاق' : 'Range Settings'}</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                 <div className="flex justify-between items-center"><label className="text-[10px] font-black text-teal-600 uppercase">{t.radius_label}</label><span className="text-xs font-black text-emerald-950 bg-teal-50 px-2 py-1 rounded-lg">{activeLocation.radius}m</span></div>
                 <input type="range" min="50" max="2000" step="50" value={activeLocation.radius} onChange={(e) => setLocations(prev => prev.map(loc => loc.id === selectedLocationId ? { ...loc, radius: parseInt(e.target.value) } : loc))} className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
              </div>
              <div className="pt-4 border-t border-emerald-50/10">
                 <div className="flex justify-between items-center mb-4"><p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{t.branch_list}</p><button onClick={() => addNewLocation()} className="text-teal-600"><PlusCircle size={16} /></button></div>
                 <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {locations.map(loc => (
                      <div key={loc.id} onClick={() => setSelectedLocationId(loc.id)} className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${selectedLocationId === loc.id ? 'bg-[#0B2545] border-emerald-900 text-white shadow-lg' : 'bg-teal-50/50 border-transparent hover:border-emerald-200'}`}>
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${selectedLocationId === loc.id ? 'bg-white/10' : 'bg-white'}`}><MapPin size={14} className={selectedLocationId === loc.id ? 'text-emerald-400' : 'text-teal-600'} /></div>
                           <div className="flex flex-col"><span className="text-[11px] font-bold truncate max-w-[100px]">{loc.name}</span><span className={`text-[8px] font-medium ${selectedLocationId === loc.id ? 'text-emerald-300' : 'text-emerald-400'}`}>{loc.radius}m</span></div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); if(locations.length > 1) { const n = locations.filter(l=>l.id!==loc.id); setLocations(n); setSelectedLocationId(n[0].id); } }} className={`opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all ${selectedLocationId === loc.id ? 'text-emerald-300' : 'text-emerald-400'}`}><Trash2 size={12} /></button>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
          <div className="bg-emerald-950 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
             <MapPinned className="mb-4 text-emerald-400" size={32} />
             <h4 className="font-black text-lg">{t.smart_hint}</h4>
             <p className="text-white/40 text-[10px] font-bold mt-2 leading-relaxed">{t.hint_msg}</p>
          </div>
        </div>
        <div className="lg:col-span-3 relative">
          <div ref={mapRef} className={`w-full h-[650px] rounded-[3.5rem] border-8 ${isDarkMode ? 'border-emerald-900' : 'border-white'} shadow-2xl overflow-hidden`} />
        </div>
      </div>
    </div>
  );
};

const lightMapStyle = [{"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#e9e9e9"}, {"lightness": 17}]}, {"featureType": "landscape", "elementType": "geometry", "stylers": [{"color": "#f5f5f5"}, {"lightness": 20}]}, {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"color": "#ffffff"}, {"lightness": 17}]}];
const darkMapStyle = [{"elementType": "geometry", "stylers": [{"color": "#064e3b"}]}, {"elementType": "labels.text.stroke", "stylers": [{"color": "#064e3b"}]}, {"elementType": "labels.text.fill", "stylers": [{"color": "#ffffff"}]}, {"featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#053d2e"}]}, {"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#042f24"}]}];
