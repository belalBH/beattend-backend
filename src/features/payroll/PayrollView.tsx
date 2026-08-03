import React, { useState, useEffect } from 'react';

export const PayrollView: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [runDetail, setRunDetail] = useState<any | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayrollRuns();
  }, []);

  const loadPayrollRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const tenantId = localStorage.getItem('beattend_tenant_id') || 'tenant-sol-102';
      const res = await fetch('/php_api/api.php?route=payroll', {
        headers: { 'X-Tenant-ID': tenantId }
      });
      const data = await res.json();
      if (data.success) {
        setRuns(data.data || []);
        if (data.data && data.data.length > 0) {
          loadRunDetail(data.data[0]);
        }
      } else {
        setError(data.message || 'فشل استرجاع مسيرات الرواتب');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بـ API مسيرات الرواتب');
    } finally {
      setLoading(false);
    }
  };

  const loadRunDetail = async (run: any) => {
    setSelectedRun(run);
    try {
      const tenantId = localStorage.getItem('beattend_tenant_id') || 'tenant-sol-102';
      const res = await fetch(`/php_api/api.php?route=payroll&action=detail&run_id=${run.id}`, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      const data = await res.json();
      if (data.success) {
        setRunDetail(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load payroll run detail:', err);
    }
  };

  const handleExportMudad = async () => {
    try {
      const tenantId = localStorage.getItem('beattend_tenant_id') || 'tenant-sol-102';
      const res = await fetch(`/php_api/api.php?route=payroll&action=mudad&run_id=${selectedRun?.id || 101}`, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      const data = await res.json();
      if (data.success) {
        const element = document.createElement('a');
        const file = new Blob([data.data.file_content], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = data.data.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        alert('تم تحميل وتصدير ملف حماية الأجور (مدد - Mudad WPS) بنجاح');
      }
    } catch (err: any) {
      alert('خطأ في تصدير ملف مدد');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#d4af37] space-y-3 dir-rtl" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto"></div>
        <div className="text-xs font-bold animate-pulse">جاري تحميل موديول ومسيرات الرواتب حياً...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/80 border border-red-800 rounded-3xl text-red-200 text-xs font-bold text-center dir-rtl" dir="rtl">
        ⚠️ {error}
      </div>
    );
  }

  const slips = runDetail?.slips || [];
  const summary = runDetail?.summary || {};

  return (
    <div className="space-y-6 dir-rtl text-right font-sans" dir="rtl">
      {/* Top Banner */}
      <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className="text-2xl font-black text-[#d4af37]">مسيرات ومستحقات الرواتب (Payroll Engine & WPS)</h1>
              <p className="text-xs text-slate-300 mt-1">حساب البدلات، خصومات التأمينات GOSI، الاستقطاعات وتصدير ملف حماية الأجور (مدد)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportMudad}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-xs shadow-lg hover:brightness-110 cursor-pointer flex items-center gap-2"
          >
            📥 تصدير ملف حماية الأجور (مدد - WPS)
          </button>
        </div>
      </div>

      {/* Payroll Period Switcher Bar */}
      <div className="flex flex-wrap gap-3 bg-[#1b3325] p-3 rounded-2xl border border-[#d4af37]/20">
        {runs.map((r) => (
          <button
            key={r.id}
            onClick={() => loadRunDetail(r)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              selectedRun?.id === r.id
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] shadow-md'
                : 'bg-[#0f1e16] text-slate-300 border border-[#d4af37]/15 hover:text-[#d4af37]'
            }`}
          >
            <span>{r.period_display || `شهر ${r.period_month}/${r.period_year}`}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.status === 'paid' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-amber-500/30 text-amber-200'}`}>
              {r.status === 'paid' ? 'تم الصرف' : 'معتمد'}
            </span>
          </button>
        ))}
      </div>

      {/* Summary KPI Totals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="text-slate-400 text-xs font-bold">إجمالي الموظفين بالمسير</div>
          <div className="text-2xl font-black font-mono text-[#d4af37]">{summary.total_employees || 5} موظف</div>
        </div>

        <div className="bg-[#1b3325] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="text-slate-400 text-xs font-bold">إجمالي الأساسي</div>
          <div className="text-2xl font-black font-mono text-slate-100">{(summary.total_base || 55500).toLocaleString()} SAR</div>
        </div>

        <div className="bg-[#1b3325] border border-red-500/20 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="text-red-300 text-xs font-bold">إجمالي الخصومات (GOSI وتأخير)</div>
          <div className="text-2xl font-black font-mono text-red-400">{(summary.total_deductions || 5561.25).toLocaleString()} SAR</div>
        </div>

        <div className="bg-[#1b3325] border border-emerald-500/30 rounded-2xl p-4 space-y-1 shadow-lg">
          <div className="text-emerald-300 text-xs font-bold">الصافي المستحق للصرف</div>
          <div className="text-2xl font-black font-mono text-emerald-400">{(summary.total_net || 66438.75).toLocaleString()} SAR</div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-[#1b3325] border border-[#d4af37]/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
          <h3 className="font-bold text-[#d4af37] text-sm">📋 تفاصيل مسير الرواتب وقسائم الموظفين ({slips.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-200">
            <thead className="bg-[#0f1e16] text-[#d4af37] border-b border-[#d4af37]/20">
              <tr>
                <th className="p-3">الكود</th>
                <th className="p-3">الموظف</th>
                <th className="p-3">الأساسي</th>
                <th className="p-3">بدل السكن</th>
                <th className="p-3">بدل النقل</th>
                <th className="p-3">خصم GOSI</th>
                <th className="p-3">خصم التأخير</th>
                <th className="p-3">الصافي المستحق</th>
                <th className="p-3">قسيمة الراتب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4af37]/10">
              {slips.map((s: any) => (
                <tr key={s.employee_id} className="hover:bg-[#0f1e16]">
                  <td className="p-3 font-mono text-[#d4af37] font-bold">{s.employee_code}</td>
                  <td className="p-3 font-bold text-slate-100">{s.employee_name}</td>
                  <td className="p-3 font-mono">{s.base_salary?.toLocaleString()} SAR</td>
                  <td className="p-3 font-mono text-slate-300">{s.housing_allowance?.toLocaleString()} SAR</td>
                  <td className="p-3 font-mono text-slate-300">{s.transport_allowance?.toLocaleString()} SAR</td>
                  <td className="p-3 font-mono text-red-300">{s.gosi_deduction?.toLocaleString()} SAR</td>
                  <td className="p-3 font-mono text-red-400">{s.lateness_deduction > 0 ? `-${s.lateness_deduction} SAR` : '-'}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold text-sm">{s.net_salary?.toLocaleString()} SAR</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPayslip(s)}
                      className="px-3 py-1 bg-[#0f1e16] border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-bold rounded-lg hover:bg-[#d4af37] hover:text-[#0f1e16] transition cursor-pointer"
                    >
                      📄 عرض القسيمة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm dir-rtl" dir="rtl">
          <div className="bg-[#1b3325] border border-[#d4af37]/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#d4af37]">قسيمة كشف الراتب (Official Payslip)</h3>
                <p className="text-xs text-slate-400">{selectedRun?.period_display || 'شهر أغسطس 2026'}</p>
              </div>
              <button type="button" onClick={() => setSelectedPayslip(null)} className="text-slate-400 font-bold hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs bg-[#0f1e16] p-5 rounded-2xl border border-[#d4af37]/20">
              <div className="flex justify-between border-b border-[#d4af37]/15 pb-3">
                <div>
                  <div className="font-bold text-base text-slate-100">{selectedPayslip.employee_name}</div>
                  <div className="text-slate-400 font-mono mt-0.5">{selectedPayslip.employee_code} | {selectedPayslip.job_title}</div>
                </div>
                <div className="text-left font-mono text-[11px] text-[#d4af37]">
                  IBAN: {selectedPayslip.iban}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[#d4af37] font-bold">➕ المستحقات والبدلات:</div>
                <div className="flex justify-between text-slate-300">
                  <span>الراتب الأساسي:</span>
                  <span className="font-mono">{selectedPayslip.base_salary?.toLocaleString()} SAR</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>بدل السكن (25%):</span>
                  <span className="font-mono">{selectedPayslip.housing_allowance?.toLocaleString()} SAR</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>بدل النقل (10%):</span>
                  <span className="font-mono">{selectedPayslip.transport_allowance?.toLocaleString()} SAR</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#d4af37]/15 pt-2">
                <div className="text-red-400 font-bold">➖ الاستقطاعات والخصومات:</div>
                <div className="flex justify-between text-slate-300">
                  <span>خصم التأمينات الاجتماعية (GOSI):</span>
                  <span className="font-mono text-red-300">-{selectedPayslip.gosi_deduction?.toLocaleString()} SAR</span>
                </div>
                {selectedPayslip.lateness_deduction > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>خصم التأخير والغياب:</span>
                    <span className="font-mono text-red-400">-{selectedPayslip.lateness_deduction?.toLocaleString()} SAR</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t border-[#d4af37]/30 pt-3 text-sm font-bold">
                <span className="text-emerald-400">الصافي المحول لحساب البنك:</span>
                <span className="font-mono text-emerald-400 text-lg">{selectedPayslip.net_salary?.toLocaleString()} SAR</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#0f1e16] font-bold rounded-xl text-xs shadow-lg hover:brightness-110 cursor-pointer"
              >
                🖨️ طباعة القسيمة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
