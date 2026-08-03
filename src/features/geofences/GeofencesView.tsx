import React, { useState, useEffect } from 'react';
import { geofenceService } from './services/geofence.service';
import { GeofenceFull, GeofenceInput } from './types/geofence.types';
import { GeofenceCard } from './components/GeofenceCard';
import { GeofenceModal } from './components/GeofenceModal';
import { GeofenceTesterModal } from './components/GeofenceTesterModal';
import { LinkEmployeesDrawer } from './components/LinkEmployeesDrawer';

export const GeofencesView: React.FC = () => {
  const [geofences, setGeofences] = useState<GeofenceFull[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Drawers State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGeofence, setEditingGeofence] = useState<GeofenceFull | null>(null);

  const [testingGeofence, setTestingGeofence] = useState<GeofenceFull | null>(null);
  const [linkingGeofence, setLinkingGeofence] = useState<GeofenceFull | null>(null);

  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await geofenceService.getGeofences();
      setGeofences(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل المواقع الجغرافية');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (input: GeofenceInput) => {
    if (editingGeofence) {
      await geofenceService.updateGeofence(editingGeofence.id, input);
    } else {
      await geofenceService.createGeofence(input);
    }
    loadGeofences();
  };

  const handleDelete = async (geo: GeofenceFull) => {
    if (!window.confirm(`⚠️ تأكيد الحذف: هل أنت تأكد من حذف موقع (${geo.name_ar}) من قاعدة البيانات؟`)) return;
    try {
      await geofenceService.deleteGeofence(geo.id);
      loadGeofences();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الموقع');
    }
  };

  const filteredGeofences = geofences.filter(g =>
    g.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.name_en && g.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 dir-rtl text-right p-2 md:p-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📍</span>
            <div>
              <h1 className="text-2xl font-black text-[#d4af37]">إدارة النطاق والمواقع الجغرافية (Geofencing Suite)</h1>
              <p className="text-xs text-slate-300 mt-1">تحديد الدوائر الإحداثية، أنصاف أقطار المسموحية، ومطابقة بصمة الموظفين بالـ GPS</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => { setEditingGeofence(null); setIsModalOpen(true); }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            + إضافة موقع جديد
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#1b3325]/90 border border-[#d4af37]/20 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="بحث باسم الموقع الجغرافي..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2 bg-[#0f1e16] border border-[#d4af37]/30 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-[#d4af37]"
        />
        <div className="text-xs text-slate-400 font-mono">
          إجمالي المواقع المعتمدة: <span className="text-[#d4af37] font-bold">{geofences.length}</span> مواقع
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#d4af37] text-sm font-bold animate-pulse">جاري تحميل النطاقات الجغرافية من Staging DB...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/60 border border-red-500 rounded-2xl text-red-200 text-xs font-bold text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Geofences Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGeofences.map((geo) => (
            <GeofenceCard
              key={geo.id}
              geofence={geo}
              onEdit={(g) => { setEditingGeofence(g); setIsModalOpen(true); }}
              onDelete={handleDelete}
              onTestRadius={(g) => setTestingGeofence(g)}
              onLinkEmployees={(g) => setLinkingGeofence(g)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <GeofenceModal
        isOpen={isModalOpen}
        editingGeofence={editingGeofence}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
      />

      {/* Geofence Tester Modal */}
      <GeofenceTesterModal
        isOpen={!!testingGeofence}
        geofence={testingGeofence}
        onClose={() => setTestingGeofence(null)}
      />

      {/* Link Employees Drawer */}
      <LinkEmployeesDrawer
        isOpen={!!linkingGeofence}
        geofence={linkingGeofence}
        onClose={() => setLinkingGeofence(null)}
        onSaved={loadGeofences}
      />
    </div>
  );
};
