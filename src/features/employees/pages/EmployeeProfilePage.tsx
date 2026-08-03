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

  // Requirement #6: Prevent rendering empty form if loading failed completely
  if (serverError && !formData.first_name) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6 dir-rtl text-right" dir="rtl">
        <div className="p-8 bg-[#1b3325]/90 border border-red-500/40 rounded-3xl max-w-lg w-full text-center space-y-4 shadow-2xl backdrop-blur-md">
          <span className="text-5xl block">⚠️</span>
          <h2 className="text-xl font-bold text-red-300">تعذر تحميل بيانات الموظف</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-[#0f1e16] p-3 rounded-xl border border-red-500/20">
            {serverError}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              🔄 إعادة المحاولة
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 bg-[#0f1e16] text-slate-300 border border-[#d4af37]/30 font-bold rounded-xl text-xs hover:text-[#d4af37] transition cursor-pointer"
            >
              ↩️ العودة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dir-rtl text-right p-2 md:p-6" dir="rtl">
      {/* Toast Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-900/60 border border-emerald-500 rounded-2xl text-emerald-200 flex justify-between items-center shadow-xl">
          <span className="font-bold">✅ {successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold px-2 cursor-pointer">✕</button>
        </div>
      )}
      {serverError && (
        <div className="p-4 bg-red-900/60 border border-red-500 rounded-2xl text-red-200 flex justify-between items-center shadow-xl">
          <span className="font-bold">⚠️ {serverError}</span>
          <button type="button" onClick={() => setServerError(null)} className="text-red-400 font-bold px-2 cursor-pointer">✕</button>
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
            errors={errors}
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
            documents={formData.documents || []}
            isEditing={isEditing}
            onAddDocument={(doc) => handleFieldChange('documents', [...(formData.documents || []), doc])}
            onDeleteDocument={(id) => handleFieldChange('documents', (formData.documents || []).filter(d => d.id !== id))}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab
            formData={formData}
            options={options}
            isEditing={isEditing}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {activeTab === 'geofence' && (
          <GeofenceTab
            formData={formData}
            options={options}
            isEditing={isEditing}
            onChange={handleFieldChange}
            errors={errors}
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
            errors={errors}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceInformationTab employeeId={employeeId} />
        )}

        {activeTab === 'leaves' && (
          <LeavesInformationTab employeeId={employeeId} />
        )}

        {activeTab === 'payroll' && (
          <PayrollInformationTab employeeId={employeeId} />
        )}

        {activeTab === 'audit' && (
          <AuditLogInformationTab employeeId={employeeId} />
        )}
      </div>
    </div>
  );
};
