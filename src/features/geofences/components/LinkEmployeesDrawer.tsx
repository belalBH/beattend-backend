import React, { useState, useEffect } from 'react';
import { GeofenceFull } from '../types/geofence.types';
import { geofenceService } from '../services/geofence.service';
import { apiService } from '../../../services/api.service';
import { Employee } from '../../../types';

interface Props {
  isOpen: boolean;
  geofence: GeofenceFull | null;
  onClose: () => void;
  onSaved: () => void;
}

export const LinkEmployeesDrawer: React.FC<Props> = ({
  isOpen,
  geofence,
  onClose,
  onSaved
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && geofence) {
      apiService.getEmployees().then(setEmployees);
      setSelectedIds(geofence.linked_employee_ids || [1, 2]);
    }
  }, [isOpen, geofence]);

  if (!isOpen || !geofence) return null;

  const handleToggleEmployee = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSaveLinks = async () => {
    setSaving(true);
    try {
      await geofenceService.linkEmployees(geofence.id, selectedIds);
      alert(`تم ربط ${selectedIds.length} موظف بموقع (${geofence.name_ar}) بنجاح`);
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'فشل ربط الموظفين بالموقع');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
      <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#d4af37]">👥 ربط الموظفين بالنطاق الجغرافي</h2>
            <p className="text-xs text-slate-400">{geofence.name_ar}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 font-bold hover:text-white text-lg cursor-pointer">✕</button>
        </div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {employees.map((emp) => (
            <label
              key={emp.id}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                selectedIds.includes(emp.id)
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                  : 'bg-[#0f1e16] border-[#d4af37]/15 text-slate-300 hover:border-[#d4af37]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(emp.id)}
                  onChange={() => handleToggleEmployee(emp.id)}
                  className="w-4 h-4 accent-[#d4af37] rounded"
                />
                <div>
                  <span className="text-sm font-bold block">{emp.first_name} {emp.last_name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{emp.empNo || `EMP-${emp.id}`} | {emp.job_title || 'موظف'}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#d4af37]">
                {selectedIds.includes(emp.id) ? 'مرتبط 📍' : 'غير مرتبط'}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#d4af37]/20">
          <button
            type="button"
            onClick={handleSaveLinks}
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            {saving ? 'جاري التحديث...' : `💾 حفظ ربط الموظفين (${selectedIds.length})`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 bg-[#0f1e16] text-slate-300 border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:text-[#d4af37] transition cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
