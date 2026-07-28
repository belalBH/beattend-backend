import React, { useState } from "react";
import { HRRequest } from "../types";
import { 
  FileText, Calendar, DollarSign, PlaneTakeoff, Clock, Check, X, AlertCircle, 
  Send, UserCheck, Inbox, PlusCircle, CheckCircle2, XCircle, Info
} from "lucide-react";

interface RequestsViewProps {
  requests: HRRequest[];
  onAddRequest: (newReq: Omit<HRRequest, "id" | "dateSubmitted" | "status">) => void;
  onUpdateRequestStatus: (id: string, status: HRRequest["status"]) => void;
  onDeleteRequest: (id: string) => void;
}

export default function RequestsView({
  requests,
  onAddRequest,
  onUpdateRequestStatus,
  onDeleteRequest,
}: RequestsViewProps) {
  // Form states
  const [reqType, setReqType] = useState<HRRequest["type"]>("leave");
  const [notes, setNotes] = useState("");
  
  // Specific fields
  const [startDate, setStartDate] = useState("2026-07-20");
  const [endDate, setEndDate] = useState("2026-07-25");
  const [leaveType, setLeaveType] = useState("Annual / سنوية");
  
  const [loanAmount, setLoanAmount] = useState("5000");
  const [repaymentMonths, setRepaymentMonths] = useState("6");
  
  const [destination, setDestination] = useState("Riyadh / الرياض");
  const [purpose, setPurpose] = useState("Corporate Strategy Review");
  
  const [hoursRequested, setHoursRequested] = useState("4");
  const [overtimeDate, setOvertimeDate] = useState("2026-07-15");
  
  const [lang, setLang] = useState<"Arabic" | "English" | "Both">("Arabic");
  const [recipient, setRecipient] = useState("Saudi National Bank (SNB)");

  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let details: HRRequest["details"] = { notes };
    let typeNameAr = "";
    let typeNameEn = "";

    switch (reqType) {
      case "leave":
        typeNameAr = "طلب إجازة";
        typeNameEn = "Leave Request";
        details = {
          ...details,
          startDate,
          endDate,
          leaveType,
        };
        break;
      case "loan":
        typeNameAr = "طلب سلفة";
        typeNameEn = "Loan Request";
        details = {
          ...details,
          amount: parseFloat(loanAmount) || 1000,
          repaymentMonths: parseInt(repaymentMonths) || 12,
        };
        break;
      case "deputation":
        typeNameAr = "طلب انتداب";
        typeNameEn = "Deputation Request";
        details = {
          ...details,
          destination,
          purpose,
          startDate,
          endDate,
        };
        break;
      case "overtime":
        typeNameAr = "طلب عمل إضافي";
        typeNameEn = "Overtime Request";
        details = {
          ...details,
          hoursRequested: parseFloat(hoursRequested) || 2,
          overtimeDate,
        };
        break;
      case "salary-certificate":
        typeNameAr = "تعريف بالراتب";
        typeNameEn = "Salary Certificate";
        details = {
          ...details,
          language: lang,
          notes: `${recipient} - ${notes}`,
        };
        break;
    }

    onAddRequest({
      type: reqType,
      typeNameAr,
      typeNameEn,
      details,
    });

    setNotes("");
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);
  };

  const getTypeIcon = (type: HRRequest["type"]) => {
    switch (type) {
      case "leave": return Calendar;
      case "loan": return DollarSign;
      case "deputation": return PlaneTakeoff;
      case "overtime": return Clock;
      case "salary-certificate": return FileText;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold font-mono">
            HR Service Center • مركز الخدمات الإلكترونية
          </p>
          <h2 className="text-2xl font-black text-white">
            Employee Requests Matrix • بوابة الطلبات
          </h2>
        </div>
        <div className="text-xs bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-neutral-400">
          Total Requests: <span className="text-brand-secondary font-bold font-mono">{requests.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submission Form Card */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/5 to-transparent pointer-events-none"></div>
          
          <div>
            <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-brand-secondary" />
              Submit Request • تقديم طلب جديد
            </h3>

            {/* Type selector */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Request Type • نوع الطلب
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "leave", icon: Calendar, labelAr: "إجازة", labelEn: "Leave" },
                    { id: "loan", icon: DollarSign, labelAr: "سلفة", labelEn: "Loan" },
                    { id: "deputation", icon: PlaneTakeoff, labelAr: "انتداب", labelEn: "Deputation" },
                    { id: "overtime", icon: Clock, labelAr: "أوفرتايم", labelEn: "Overtime" },
                    { id: "salary-certificate", icon: FileText, labelAr: "تعريف راتب", labelEn: "Salary Cert" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSel = reqType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setReqType(item.id as any)}
                        className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                          isSel 
                            ? "bg-brand-secondary/10 border-brand-secondary text-brand-secondary shadow-[0_0_10px_rgba(76,215,246,0.15)] font-bold" 
                            : "border-white/5 bg-white/5 hover:border-white/15 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[10px] text-center leading-none font-bold">{item.labelAr}</span>
                        <span className="text-[8px] opacity-75 mt-0.5">{item.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic inputs based on type */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-white/5">
                {reqType === "leave" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">From Date</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">To Date</label>
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Leave Class</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none cursor-pointer"
                      >
                        <option value="Annual / سنوية" className="bg-[#121414]">Annual Leave / إجازة سنوية</option>
                        <option value="Sick / مرضية" className="bg-[#121414]">Sick Leave / إجازة مرضية</option>
                        <option value="Emergency / اضطرارية" className="bg-[#121414]">Emergency Leave / إجازة اضطرارية</option>
                        <option value="Unpaid / بدون راتب" className="bg-[#121414]">Unpaid Leave / إجازة بدون راتب</option>
                      </select>
                    </div>
                  </div>
                )}

                {reqType === "loan" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Amount (SAR)</label>
                        <input
                          type="number"
                          required
                          min="1000"
                          max="100000"
                          step="500"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Repayment Months</label>
                        <select
                          value={repaymentMonths}
                          onChange={(e) => setRepaymentMonths(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none cursor-pointer"
                        >
                          <option value="3" className="bg-[#121414]">3 Months</option>
                          <option value="6" className="bg-[#121414]">6 Months</option>
                          <option value="12" className="bg-[#121414]">12 Months</option>
                          <option value="24" className="bg-[#121414]">24 Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {reqType === "deputation" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Destination • وجهة الانتداب</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Riyadh, Dubai"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">From Date</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">To Date</label>
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Deputation Purpose</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Attending fintech hub conference"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {reqType === "overtime" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Requested Hours</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="12"
                          step="0.5"
                          value={hoursRequested}
                          onChange={(e) => setHoursRequested(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Overtime Date</label>
                        <input
                          type="date"
                          required
                          value={overtimeDate}
                          onChange={(e) => setOvertimeDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {reqType === "salary-certificate" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Certificate Language</label>
                        <select
                          value={lang}
                          onChange={(e) => setLang(e.target.value as any)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none cursor-pointer"
                        >
                          <option value="Arabic" className="bg-[#121414]">العربية / Arabic</option>
                          <option value="English" className="bg-[#121414]">الإنجليزية / English</option>
                          <option value="Both" className="bg-[#121414]">كلاهما / Both</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">Addressing To</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Bank, Embassy"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">
                    Notes / Comments • ملاحظات إضافية
                  </label>
                  <textarea
                    placeholder="Enter context or specific justification for your request..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-secondary text-[#121414] font-bold text-xs rounded-xl hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                >
                  {formSuccess ? (
                    <>
                      <Check className="w-4 h-4 animate-bounce" />
                      Submitted Successfully • تم إرسال الطلب
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request • إرسال الطلب
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[9px] text-neutral-500 flex items-start gap-1.5 mt-4">
            <Info className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />
            <span>
              Submitted items enter standard HR execution cycle and undergo biometric authenticity confirmation automatically.
            </span>
          </div>
        </div>

        {/* List of Requests Card */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-brand-secondary" />
              Requests History Ledger • سجل الطلبات
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {requests.length === 0 ? (
                <div className="py-20 text-center text-xs text-neutral-500 font-sans flex flex-col items-center justify-center space-y-2">
                  <FileText className="w-8 h-8 text-neutral-600 animate-pulse" />
                  <p>Your requests ledger is currently empty.</p>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono">No actions recorded</p>
                </div>
              ) : (
                requests.map((req) => {
                  const Icon = getTypeIcon(req.type);
                  return (
                    <div
                      key={req.id}
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-secondary/20 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-white/5 rounded-xl text-neutral-300 border border-white/5">
                          <Icon className="w-4 h-4 text-brand-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                              {req.typeNameEn}
                            </h4>
                            <span className="text-xs text-neutral-400 font-medium">
                              • {req.typeNameAr}
                            </span>
                          </div>
                          
                          {/* Specific summary detail based on type */}
                          <div className="text-[11px] text-neutral-400 mt-1 space-y-0.5">
                            <p className="font-mono text-[9px] text-neutral-500">
                              REF: {req.id.toUpperCase()} • Submitted: {req.dateSubmitted}
                            </p>
                            {req.type === "leave" && (
                              <p className="text-neutral-300">
                                Duration: <strong className="text-white">{req.details.startDate}</strong> to <strong className="text-white">{req.details.endDate}</strong> ({req.details.leaveType})
                              </p>
                            )}
                            {req.type === "loan" && (
                              <p className="text-neutral-300">
                                Advance: <strong className="text-brand-secondary">{req.details.amount} SAR</strong> over {req.details.repaymentMonths} months
                              </p>
                            )}
                            {req.type === "deputation" && (
                              <p className="text-neutral-300">
                                Traveling to <strong className="text-white">{req.details.destination}</strong> for "{req.details.purpose}"
                              </p>
                            )}
                            {req.type === "overtime" && (
                              <p className="text-neutral-300">
                                Overtime: <strong className="text-brand-secondary">{req.details.hoursRequested} hours</strong> on {req.details.overtimeDate}
                              </p>
                            )}
                            {req.type === "salary-certificate" && (
                              <p className="text-neutral-300">
                                Salary Statement Language: <strong className="text-white">{req.details.language}</strong> ({req.details.notes})
                              </p>
                            )}
                            {req.details.notes && !req.type && (
                              <p className="italic text-neutral-500">"{req.details.notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status + Admin controller */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 pt-2 md:pt-0 border-t border-white/5 md:border-none">
                        <div className="flex items-center gap-2">
                          {req.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/10 border border-amber-400/20 text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pending • معلق
                            </span>
                          )}
                          {req.status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved • مقبول
                            </span>
                          )}
                          {req.status === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-400">
                              <XCircle className="w-3 h-3" />
                              Rejected • مرفوض
                            </span>
                          )}
                        </div>

                        {/* Interactive simulation controls */}
                        <div className="flex gap-1">
                          {req.status === "pending" ? (
                            <>
                              <button
                                onClick={() => onUpdateRequestStatus(req.id, "approved")}
                                className="p-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all cursor-pointer"
                                title="Approve Request (Admin Sandbox)"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onUpdateRequestStatus(req.id, "rejected")}
                                className="p-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded hover:bg-rose-500/20 transition-all cursor-pointer"
                                title="Reject Request (Admin Sandbox)"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onDeleteRequest(req.id)}
                              className="p-1 text-[9px] text-neutral-500 hover:text-white transition-all cursor-pointer"
                              title="Delete Archive Log"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-4 text-right">
            <span className="font-mono text-[10px] text-neutral-500">
              SECURE LEDGER INTEGRITY INDEX: 0x93FA..C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
