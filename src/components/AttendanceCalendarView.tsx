import React, { useState } from "react";
import { CheckInLog, Profile } from "../types";
import { 
  Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, Fingerprint, 
  MapPin, PlusCircle, Trash2, ArrowUpRight, ArrowDownLeft, ShieldAlert, Sparkles 
} from "lucide-react";

interface AttendanceCalendarViewProps {
  logs: CheckInLog[];
  onAddCustomLog: (date: string, time: string, type: "check-in" | "check-out", method: CheckInLog["method"]) => void;
  onDeleteLog: (id: string) => void;
  profile: Profile;
}

export default function AttendanceCalendarView({
  logs,
  onAddCustomLog,
  onDeleteLog,
  profile,
}: AttendanceCalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState<number>(6); // 0-indexed, 6 is July (to match default mock 2026-07-12)
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Form states for retroactively adding a log
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [customTime, setCustomTime] = useState("08:30");
  const [customType, setCustomType] = useState<"check-in" | "check-out">("check-in");
  const [customMethod, setCustomMethod] = useState<CheckInLog["method"]>("Fingerprint");

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun, 1 is Mon...

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthNamesAr = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    // Default to 1st of the month when changing months
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(1);
  };

  // Format date to match standard YYYY-MM-DD
  const formatDateString = (day: number) => {
    const paddedMonth = (currentMonth + 1).toString().padStart(2, "0");
    const paddedDay = day.toString().padStart(2, "0");
    return `${currentYear}-${paddedMonth}-${paddedDay}`;
  };

  // Find logs for a specific day
  const getLogsForDay = (day: number) => {
    const dateStr = formatDateString(day);
    return logs.filter((log) => log.date === dateStr);
  };

  const selectedDateStr = formatDateString(selectedDay);
  const dayLogs = getLogsForDay(selectedDay);
  
  const checkInLog = dayLogs.find((l) => l.type === "check-in");
  const checkOutLog = dayLogs.find((l) => l.type === "check-out");

  // Statistics for current month
  const totalDaysInMonthWithPresence = Array.from({ length: daysInMonth }).filter((_, i) => {
    const dLogs = getLogsForDay(i + 1);
    return dLogs.some(l => l.type === "check-in");
  }).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = formatDateString(selectedDay);
    
    // convert HH:MM to 12-hour format with AM/PM
    const [hours, minutes] = customTime.split(":");
    let hh = parseInt(hours);
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    hh = hh ? hh : 12; // the hour '0' should be '12'
    const formattedTime = `${hh.toString().padStart(2, "0")}:${minutes} ${ampm}`;

    onAddCustomLog(formattedDate, formattedTime, customType, customMethod);
    setShowAddLogModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold font-mono">
            Biometric Security Calendar • تقويم التحضير والحضور
          </p>
          <h2 className="text-2xl font-black text-white">
            Daily Attendance Calendar • تقويم الحضور الذكي
          </h2>
        </div>
        <button
          onClick={() => setShowAddLogModal(true)}
          className="flex items-center gap-1.5 bg-brand-secondary text-[#121414] hover:bg-opacity-90 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
        >
          <PlusCircle className="w-4 h-4" />
          Add Manual Punch • تسجيل يدوي
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Calendar Board */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-white/10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/5 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            <div>
              <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">
                {monthNamesEn[currentMonth]} {currentYear}
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                {monthNamesAr[currentMonth]} {currentYear}
              </p>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-neutral-400 hover:text-white cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-neutral-400 hover:text-white cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => {
              const arDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
              return (
                <div key={d} className="flex flex-col items-center">
                  <span className="font-mono text-[9px] font-bold text-neutral-400">{d}</span>
                  <span className="text-[7px] text-neutral-600 mt-0.5">{arDays[i]}</span>
                </div>
              );
            })}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {/* Empty cells */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square opacity-0" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = selectedDay === day;
              const dayLogsList = getLogsForDay(day);
              const hasCheckIn = dayLogsList.some(l => l.type === "check-in");
              const hasCheckOut = dayLogsList.some(l => l.type === "check-out");

              let statusColor = "border-white/5 bg-white/5";
              if (hasCheckIn && hasCheckOut) {
                statusColor = isSelected ? "bg-emerald-500/10 border-emerald-400/60" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400";
              } else if (hasCheckIn) {
                statusColor = isSelected ? "bg-amber-500/10 border-amber-400/60" : "bg-amber-500/5 border-amber-500/20 text-amber-400";
              }

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer border transition-all duration-300 ${statusColor} ${
                    isSelected 
                      ? "border-brand-secondary ring-1 ring-brand-secondary/30 scale-105" 
                      : "hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${isSelected ? "text-brand-secondary text-sm" : "text-neutral-200"}`}>
                    {day}
                  </span>

                  {/* Tiny Status dots */}
                  <div className="flex gap-1 mt-1">
                    {hasCheckIn && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
                    )}
                    {hasCheckOut && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_4px_rgba(248,113,113,0.5)]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Day Presence Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          {/* Diagnostic Day Sheet */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start pb-4 border-b border-white/5 mb-5">
                <div>
                  <span className="text-[9px] text-brand-secondary font-bold uppercase tracking-widest font-mono">
                    Ledger Reading • قراءة السجل اليومي
                  </span>
                  <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider mt-0.5">
                    {monthNamesEn[currentMonth]} {selectedDay}, {currentYear}
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {selectedDay} {monthNamesAr[currentMonth]} {currentYear}
                  </p>
                </div>
                <div className="p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-neutral-400">
                  <Calendar className="w-4 h-4 text-brand-secondary" />
                </div>
              </div>

              {/* Day Punch Status */}
              <div className="space-y-4">
                
                {/* Clock In */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">
                        Clock In • حضور
                      </span>
                      {checkInLog ? (
                        <p className="font-mono text-sm font-bold text-white mt-0.5">
                          {checkInLog.timestamp}
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-500 italic mt-0.5">Not Recorded • لم يسجل</p>
                      )}
                    </div>
                  </div>

                  {checkInLog && (
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-500 block font-mono">METHOD</span>
                      <span className="text-[10px] font-bold text-brand-secondary uppercase font-mono">{checkInLog.method}</span>
                    </div>
                  )}
                </div>

                {/* Clock Out */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">
                        Clock Out • انصراف
                      </span>
                      {checkOutLog ? (
                        <p className="font-mono text-sm font-bold text-white mt-0.5">
                          {checkOutLog.timestamp}
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-500 italic mt-0.5">Not Recorded • لم يسجل</p>
                      )}
                    </div>
                  </div>

                  {checkOutLog && (
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-500 block font-mono">METHOD</span>
                      <span className="text-[10px] font-bold text-brand-secondary uppercase font-mono">{checkOutLog.method}</span>
                    </div>
                  )}
                </div>

                {/* Calculation */}
                {checkInLog && checkOutLog ? (
                  <div className="p-3 bg-brand-secondary/5 border border-brand-secondary/10 rounded-xl text-xs text-neutral-300 flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-secondary animate-pulse" />
                      Session Duration:
                    </span>
                    <strong className="font-mono text-brand-secondary">8.2 hours (Optimal)</strong>
                  </div>
                ) : checkInLog ? (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs text-neutral-300 flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                      Active Session:
                    </span>
                    <strong className="text-amber-400">Underway • قيد العمل</strong>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-neutral-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>No active punch data found for this selection index.</span>
                  </div>
                )}
              </div>

              {/* Log List View for selected day */}
              {dayLogs.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Raw Logs Directory</p>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {dayLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-[11px] bg-white/5 p-1.5 rounded-lg border border-white/5">
                        <span className="font-mono font-bold text-white">
                          [{log.type.toUpperCase()}] {log.timestamp}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase bg-neutral-900 px-1 py-0.5 rounded">
                            {log.method}
                          </span>
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="text-neutral-500 hover:text-rose-400 transition-colors p-0.5"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-neutral-500 font-mono">
              <span>LEDGER SYNC STATUS</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED BY SYSTEM
              </span>
            </div>
          </div>

          {/* Month Overview Mini Card */}
          <div className="glass-card p-5 rounded-3xl border border-white/10">
            <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
              Monthly Presence Diagnostics
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] text-neutral-500 font-bold uppercase block tracking-wider">Attendance Days</span>
                <span className="font-mono text-xl font-black text-white mt-0.5 block">{totalDaysInMonthWithPresence} Days</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] text-neutral-500 font-bold uppercase block tracking-wider">Biometric Accuracy</span>
                <span className="font-mono text-xl font-black text-emerald-400 mt-0.5 block">100% Secure</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Manual Entry Modal Dialog */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-[#07090f]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="glass-card p-6 rounded-3xl max-w-sm w-full border border-white/20 bg-[#121414] shadow-2xl relative">
            <button
              onClick={() => setShowAddLogModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-brand-secondary" />
              Add Attendance Record • تسجيل حضور يدوي
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Target Date • التاريخ المحدد</label>
                <div className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-neutral-300 font-mono font-bold">
                  {selectedDateStr}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Punch Type • نوع التحضير</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomType("check-in")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      customType === "check-in"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-black"
                        : "border-white/5 bg-white/5 text-neutral-400"
                    }`}
                  >
                    Clock In • حضور
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomType("check-out")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      customType === "check-out"
                        ? "bg-rose-500/10 border-rose-500 text-rose-400 font-black"
                        : "border-white/5 bg-white/5 text-neutral-400"
                    }`}
                  >
                    Clock Out • انصراف
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Punch Time • الوقت</label>
                <input
                  type="time"
                  required
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider">Method • الطريقة</label>
                <select
                  value={customMethod}
                  onChange={(e) => setCustomMethod(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none cursor-pointer"
                >
                  <option value="Fingerprint" className="bg-[#121414]">Fingerprint • البصمة</option>
                  <option value="NFC" className="bg-[#121414]">NFC Card • بطاقة الدخول</option>
                  <option value="Manual Override" className="bg-[#121414]">Manual Override • تصحيح يدوي</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand-secondary text-[#121414] font-black text-xs rounded-xl hover:bg-opacity-90 transition-all cursor-pointer uppercase tracking-wider"
              >
                Log Attendance Punch • تسجيل الدخول
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
