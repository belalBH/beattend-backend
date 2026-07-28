import { useState } from "react";
import { Engagement } from "../types";
import { Calendar, Plus, Clock, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarTimelineViewProps {
  engagements: Engagement[];
  onAddEngagement: (newEng: Omit<Engagement, "id">) => void;
  onSelect: (engagement: Engagement) => void;
}

export default function CalendarTimelineView({
  engagements,
  onAddEngagement,
  onSelect,
}: CalendarTimelineViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(14); // Default Oct 14 matches engagements
  const [month, setMonth] = useState<number>(9); // 0-indexed, 9 is October
  const [year, setYear] = useState<number>(2026);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // Sun is 0, Mon is 1, etc.
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Find engagements for a specific date in current month/year
  const getEngagementsForDay = (day: number) => {
    const paddedMonth = (month + 1).toString().padStart(2, "0");
    const paddedDay = day.toString().padStart(2, "0");
    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
    return engagements.filter((e) => e.date === dateStr);
  };

  const selectedDayEngagements = getEngagementsForDay(selectedDay);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold">Interactive Scheduler</p>
        <h2 className="text-2xl font-black text-white">Chronology Grid</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* The Grid Cal */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-neutral-400 hover:text-white cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-neutral-400 hover:text-white cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <span key={d} className="font-mono text-[9px] font-bold text-neutral-500">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank filler cells for starting day offsets */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-10 opacity-0" />
            ))}

            {/* Actual day cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = selectedDay === day;
              const dayEngagements = getEngagementsForDay(day);
              const hasEngagements = dayEngagements.length > 0;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center relative cursor-pointer border transition-all duration-300 ${
                    isSelected
                      ? "bg-brand-secondary/15 border-brand-secondary/60 text-brand-secondary shadow-[0_0_12px_rgba(76,215,246,0.25)] font-black"
                      : "border-white/5 hover:border-white/20 text-neutral-300"
                  }`}
                >
                  <span className="text-xs font-mono">{day}</span>
                  {hasEngagements && (
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                      isSelected 
                        ? "bg-brand-secondary shadow-[0_0_6px_#4cd7f6]" 
                        : "bg-brand-primary"
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda details panel */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-4 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider font-mono">Selected Chronology</span>
                <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider mt-0.5">
                  {monthNames[month]} {selectedDay}, {year}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-neutral-400">
                {selectedDayEngagements.length} Agenda
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {selectedDayEngagements.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-500 font-sans flex flex-col items-center justify-center space-y-2">
                  <Calendar className="w-6 h-6 text-neutral-600 animate-pulse" />
                  <p>No scheduled activities on this date index.</p>
                </div>
              ) : (
                selectedDayEngagements.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="p-3 bg-white/5 border border-white/5 hover:border-brand-secondary/30 rounded-xl transition-all cursor-pointer group flex justify-between items-center"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-secondary transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {item.time} • {item.location}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                      item.type === "STRATEGIC" 
                        ? "bg-rose-500/10 text-rose-400" 
                        : "bg-brand-primary/10 text-brand-primary"
                    }`}>
                      {item.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-[9px] text-neutral-500 leading-normal">
              Grid aligns on universal coordinate systems. Any modifications synchronize seamlessly across remote secure hosts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
