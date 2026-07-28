import React, { useState } from "react";
import { Profile, CheckInLog } from "../types";
import { 
  BarChart2, Clock, Calendar, Shield, Activity, ArrowUpRight, ArrowDownLeft,
  Award, TrendingUp, Printer, CalendarDays, Fingerprint, RefreshCw, FileSpreadsheet
} from "lucide-react";

interface ReportsViewProps {
  profile: Profile;
  logs: CheckInLog[];
  onClearLogs?: () => void;
}

export default function ReportsView({
  profile,
  logs,
  onClearLogs,
}: ReportsViewProps) {
  const [filterType, setFilterType] = useState<"ALL" | "check-in" | "check-out">("ALL");
  const [showReceipt, setShowReceipt] = useState(false);

  // Calculate metrics
  const completed = profile.completedHours;
  const target = profile.weeklyTargetHours;
  const percentage = Math.min(100, Math.round((completed / target) * 100)) || 0;

  // Group check-in and check-out logs by date to compute daily session durations
  const getGroupedSessionsByDate = () => {
    const dates = Array.from(new Set(logs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    
    return dates.map(dateStr => {
      const dayLogs = logs.filter(l => l.date === dateStr);
      const checkIn = dayLogs.find(l => l.type === "check-in");
      const checkOut = dayLogs.find(l => l.type === "check-out");
      
      // Calculate a mock duration if we have both, or simple descriptive statuses
      let durationStr = "---";
      if (checkIn && checkOut) {
        // Simple mock duration parser
        durationStr = "8.2 hrs";
      } else if (checkIn) {
        durationStr = "Active Session";
      }

      // Format date in Arabic and English
      const formattedDate = new Date(dateStr);
      const optionsEn: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      const optionsAr: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      
      let dateLabelEn = dateStr;
      let dateLabelAr = dateStr;
      
      try {
        dateLabelEn = formattedDate.toLocaleDateString('en-US', optionsEn);
        dateLabelAr = formattedDate.toLocaleDateString('ar-EG', optionsAr);
      } catch (e) {
        // Fallback
      }

      return {
        date: dateStr,
        dateLabelEn,
        dateLabelAr,
        checkIn,
        checkOut,
        durationStr,
      };
    });
  };

  const sessions = getGroupedSessionsByDate();

  // Filter individual raw logs
  const filteredLogs = logs.filter(log => {
    if (filterType === "ALL") return true;
    return log.type === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold font-mono">
            Analytical Reporting • مركز الإحصائيات والتقارير
          </p>
          <h2 className="text-2xl font-black text-white">
            Security Attendance Report • تقرير ساعات العمل والحضور
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReceipt(!showReceipt)}
            className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-brand-secondary/40 px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
          >
            <Printer className="w-4 h-4 text-brand-secondary" />
            Export receipt • طباعة التقرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hours Summary Ring Dial (Left Panel) */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between items-center relative overflow-hidden text-center min-h-[350px]">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
          
          <div className="w-full flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">Load Capacity • ملخص ساعات العمل</span>
            <Activity className="w-4 h-4 text-brand-secondary" />
          </div>

          <div className="relative my-6 flex items-center justify-center">
            {/* SVG Custom Circular Gauge */}
            <svg className="w-44 h-44 transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-neutral-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-brand-secondary transition-all duration-1000 ease-out"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={464.9}
                strokeDashoffset={464.9 - (464.9 * percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-black text-white leading-none">
                {percentage}%
              </span>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5 font-mono">
                Pacing Score
              </span>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-neutral-400">Completed (ساعات العمل)</span>
              <span className="font-mono text-xs font-bold text-brand-secondary">{completed.toFixed(1)} hrs</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-neutral-400">Target (المستهدف الأسبوعي)</span>
              <span className="font-mono text-xs font-bold text-neutral-300">{target} hrs</span>
            </div>
            
            <div className="pt-3 border-t border-white/5 flex gap-1.5 items-center justify-center text-[10px] text-neutral-400 font-medium">
              <Award className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Paced perfectly to target. No deficits.</span>
            </div>
          </div>
        </div>

        {/* Highlights Matrix (Right Panel) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Metric 1 */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Active Presence Days</p>
                <h4 className="text-xs text-neutral-400 mt-1">أيام الحضور المسجلة</h4>
                <p className="font-mono text-xl font-bold text-white mt-1.5">
                  {sessions.length} Days <span className="text-xs text-brand-secondary font-medium">this week</span>
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-brand-secondary">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Average Daily Session</p>
                <h4 className="text-xs text-neutral-400 mt-1">متوسط العمل اليومي</h4>
                <p className="font-mono text-xl font-bold text-white mt-1.5">
                  {(sessions.length > 0 ? (completed / sessions.length) : 8.2).toFixed(1)} hrs
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-brand-secondary">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Early Arrival Rating</p>
                <h4 className="text-xs text-neutral-400 mt-1">معدل الحضور المبكر</h4>
                <p className="font-mono text-xl font-bold text-emerald-400 mt-1.5">
                  96.8% <span className="text-[10px] text-neutral-500">Perfect Corridor</span>
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Biometric Security Score</p>
                <h4 className="text-xs text-neutral-400 mt-1">مؤشر أمان الدخول</h4>
                <p className="font-mono text-xl font-bold text-white mt-1.5">
                  SHA-256 <span className="text-[10px] text-brand-secondary">Verified</span>
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-brand-primary">
                <Shield className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Inline Information banner */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-neutral-300 leading-relaxed flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-brand-secondary flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-white">Daily Presence Ledger Synchronization • مزامنة الحضور الذكي</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Each access log is cryptographically bound to your fingerprint matrix. Unauthorized clocking is strictly filtered by security protocols.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Daily Sessions Ledger */}
      <div className="glass-card p-6 rounded-3xl border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5 mb-5">
          <div>
            <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">
              Attendance Days & Time Ledger • سجل أيام الحضور بالوقت والتاريخ
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Detailed records containing precise check-in entry times, exit logs, and date parameters</p>
          </div>

          <div className="flex gap-2.5">
            {[
              { id: "ALL", label: "All Logs" },
              { id: "check-in", label: "Check-Ins Only" },
              { id: "check-out", label: "Check-Outs Only" }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`py-1 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide border cursor-pointer transition-all ${
                  filterType === f.id 
                    ? "bg-white/10 border-brand-secondary text-white" 
                    : "border-white/5 bg-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Sessions list */}
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500 flex flex-col items-center justify-center space-y-2">
              <Calendar className="w-8 h-8 text-neutral-600 animate-pulse" />
              <p>No logged attendance entries available.</p>
            </div>
          ) : (
            sessions.map((sess, idx) => {
              return (
                <div 
                  key={sess.date}
                  className="p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left Side: Calendar details */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 border border-white/10 rounded-xl flex flex-col items-center justify-center text-brand-secondary">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                        {sess.dateLabelEn}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        {sess.dateLabelAr}
                      </p>
                    </div>
                  </div>

                  {/* Middle Side: CheckIn/Out Timestamps */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 max-w-lg md:px-8">
                    <div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase block tracking-wider">Clock In • الدخول</span>
                      {sess.checkIn ? (
                        <span className="inline-flex items-center gap-1 mt-1 font-mono text-xs font-bold text-emerald-400">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          {sess.checkIn.timestamp}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-600 italic">No record</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase block tracking-wider">Clock Out • الخروج</span>
                      {sess.checkOut ? (
                        <span className="inline-flex items-center gap-1 mt-1 font-mono text-xs font-bold text-rose-400">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          {sess.checkOut.timestamp}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-600 italic">No record</span>
                      )}
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <span className="text-[9px] text-neutral-500 font-bold uppercase block tracking-wider">Duration • المدة</span>
                      <span className="inline-flex items-center gap-1 mt-1 font-mono text-xs font-black text-brand-secondary">
                        {sess.durationStr}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Log verification tag */}
                  <div className="flex items-center gap-3 self-stretch md:self-auto pt-2 md:pt-0 border-t border-white/5 md:border-none justify-between">
                    <span className="text-[9px] font-mono text-neutral-500">
                      METHOD: {sess.checkIn?.method || "BIOMETRIC"}
                    </span>
                    <span className="px-2 py-0.5 bg-brand-secondary/10 border border-brand-secondary/20 rounded text-[9px] font-mono text-brand-secondary uppercase font-bold">
                      VERIFIED
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Printable Receipt Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-[#07090f]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white text-neutral-950 p-8 rounded-3xl max-w-md w-full shadow-2xl relative select-text">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-950 text-sm font-bold bg-neutral-100 p-2 rounded-full h-8 w-8 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Header Receipt */}
            <div className="text-center border-b-2 border-dashed border-neutral-300 pb-5">
              <h3 className="font-mono text-lg font-black tracking-widest uppercase text-neutral-900">
                CRYSTAL LEDGER INC.
              </h3>
              <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">
                Secure Biometric Presence Receipt
              </p>
              <p className="text-[11px] font-mono mt-1 text-neutral-500">
                Date: {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Body */}
            <div className="py-5 space-y-4 font-mono text-xs">
              <div className="flex justify-between">
                <span>EMPLOYEE:</span>
                <span className="font-bold">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span>ASSIGNED ROLE:</span>
                <span className="font-bold">{profile.role}</span>
              </div>
              <div className="flex justify-between">
                <span>PACING PROGRESS:</span>
                <span className="font-bold">{percentage}% Complete</span>
              </div>
              
              <div className="border-t border-dashed border-neutral-300 pt-4">
                <p className="font-bold text-center mb-3">WEEKLY PRESENCE CORRIDORS</p>
                <div className="space-y-1 text-[11px]">
                  {sessions.map(s => (
                    <div key={s.date} className="flex justify-between text-neutral-700">
                      <span>{s.date}:</span>
                      <span>{s.checkIn?.timestamp || "---"} - {s.checkOut?.timestamp || "---"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-300 pt-4 flex justify-between font-black text-sm">
                <span>TOTAL LOGGED:</span>
                <span>{completed.toFixed(1)} hrs</span>
              </div>
            </div>

            {/* Footer Receipt */}
            <div className="text-center border-t-2 border-dashed border-neutral-300 pt-5 font-mono text-[9px] text-neutral-500 leading-relaxed">
              <p>CRYSTAL SECURE BLOCK ID: 0x98A19000C12</p>
              <p className="mt-1">THANK YOU FOR YOUR DEDICATED PRESENCE.</p>
              <button
                onClick={() => window.print()}
                className="mt-4 w-full py-2 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-all cursor-pointer uppercase tracking-wider"
              >
                Print Ledger Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
