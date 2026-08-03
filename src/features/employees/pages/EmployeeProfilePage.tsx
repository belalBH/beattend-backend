import React from 'react';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { EmployeeHeader } from '../components/EmployeeHeader';
import { EmployeeTabs } from '../components/EmployeeTabs';
import { BasicInformationTab } from '../components/BasicInformationTab';
import { JobInformationTab } from '../components/JobInformationTab';
import { EmergencyInformationTab } from '../components/EmergencyInformationTab';
import { DocumentsTab } from '../components/DocumentsTab';
import { AccountsTab } from '../components/AccountsTab';
import { GeofenceTab } from '../components/GeofenceTab';
import { BankTab } from '../components/BankTab';
import { AdditionalInformationTab } from '../components/AdditionalInformationTab';
import { AttendanceInformationTab } from '../components/AttendanceInformationTab';
import { LeavesInformationTab } from '../components/LeavesInformationTab';
import { PayrollInformationTab } from '../components/PayrollInformationTab';
import { AuditLogInformationTab } from '../components/AuditLogInformationTab';

interface Props {
  employeeId: number;
  onBack: () => void;
}

export const EmployeeProfilePage: React.FC<Props> = ({ employeeId, onBack }) => {
  const {
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    loading,
    submitting,
    serverError,
    setServerError,
    successMsg,
    setSuccessMsg,
    formData,
    options,
    errors,
    handleFieldChange,
    resetForm,
    saveEmployee
  } = useEmployeeForm(employeeId, () => {
    console.log('[EmployeeProfilePage] Data saved successfully to staging db');
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#d4af37] font-bold text-lg animate-pulse">
          جاري تحميل ملف الموظف الكامل والقوائم المعتمدة من Staging...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 dir-rtl text-right p-2 md:p-6" dir="rtl">
      {/* Toast Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-900/60 border border-emerald-500 rounded-2xl text-emerald-200 flex justify-between items-center shadow-xl">
          <span className="font-bold">✅ {successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold px-2">✕</button>
        </div>
      )}
      {serverError && (
        <div className="p-4 bg-red-900/60 border border-red-500 rounded-2xl text-red-200 flex justify-between items-center shadow-xl">
          <span className="font-bold">⚠️ {serverError}</span>
          <button type="button" onClick={() => setServerError(null)} className="text-red-400 font-bold px-2">✕</button>
        </div>
      )}

      {/* Page Header */}
      <EmployeeHeader
        formData={formData}
        isEditing={isEditing}
        submitting={submitting}
        onEditToggle={() => setIsEditing(true)}
        onSave={(closeAfterSave) => saveEmployee(closeAfterSave, onBack)}
        onReset={resetForm}
        onCancel={() => { setIsEditing(false); resetForm(); }}
        onBack={onBack}
      />

      {/* Horizontal Tabs Bar */}
      <EmployeeTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Tab Content */}
      <div className="bg-[#1b3325]/50 border border-[#d4af37]/20 rounded-2xl p-6 shadow-2xl backdrop-blur-md min-h-[50vh]">
        {activeTab === 'basic' && (
          <BasicInformationTab
            formData={formData}
            options={options}
            isEditing={isEditing}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {activeTab === 'job' && (
          <JobInformationTab
            formData={formData}
            options={options}
            isEditing={isEditing}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyInformationTab
            formData={formData}
            isEditing={isEditing}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            formData={formData}
            isEditing={isEditing}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab
            formData={formData}
            options={options}
            isEditing={isEditing}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === 'geofence' && (
          <GeofenceTab
            formData={formData}
            options={options}
            isEditing={isEditing}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === 'bank' && (
          <BankTab
            formData={formData}
            options={options}
            isEditing={isEditing}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {activeTab === 'additional' && (
          <AdditionalInformationTab
            formData={formData}
            isEditing={isEditing}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === 'attendance' && <AttendanceInformationTab />}
        {activeTab === 'leaves' && <LeavesInformationTab />}
        {activeTab === 'payroll' && <PayrollInformationTab />}
        {activeTab === 'audit' && <AuditLogInformationTab />}
      </div>

      {/* Bottom Sticky Action Bar in Edit Mode */}
      {isEditing && (
        <div className="sticky bottom-4 bg-[#1b3325]/95 border border-[#d4af37]/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex justify-between items-center z-30">
          <button
            type="button"
            onClick={() => { setIsEditing(false); resetForm(); }}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 cursor-pointer"
          >
            ✕ إلغاء التعديل
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="px-4 py-2 bg-amber-900/40 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-white transition cursor-pointer"
            >
              ↩️ استعادة القيم السابقة
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => saveEmployee(false)}
              className="px-4 py-2 bg-[#234735] text-[#d4af37] border border-[#d4af37]/40 rounded-xl font-bold text-xs hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
            >
              {submitting ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => saveEmployee(true, onBack)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              {submitting ? 'جاري الحفظ...' : '✅ حفظ وإغلاق'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
