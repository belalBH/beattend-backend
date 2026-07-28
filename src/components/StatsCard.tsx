import React, { useState } from "react";
import { Profile } from "../types";
import { Clock, MapPin, Plus, Check, Settings, BarChart2 } from "lucide-react";
import { ATTENDANCE_WEEKDAY_BARS } from "../data";

interface StatsCardProps {
  profile: Profile;
  onUpdateCompletedHours: (hours: number) => void;
  onUpdateTargetHours: (hours: number) => void;
}

export default function StatsCard({
  profile,
  onUpdateCompletedHours,
  onUpdateTargetHours,
}: StatsCardProps) {
  const [showLogHours, setShowLogHours] = useState(false);
  const [showPresenceDetails, setShowPresenceDetails] = useState(false);
  const [hoursToAdd, setHoursToAdd] = useState("");
  const [newTarget, setNewTarget] = useState(profile.weeklyTargetHours.toString());
  const [selectedDay, setSelectedDay] = useState<string | null>("THU");

  const completed = profile.completedHours;
  const target = profile.weeklyTargetHours;
  const completedPercent = Math.min(100, Math.round((completed / target) * 1000) / 10);

  const handleAddHours = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(hoursToAdd);
    if (!isNaN(val) && val > 0) {
      onUpdateCompletedHours(profile.completedHours + val);
      setHoursToAdd("");
      setShowLogHours(false);
    }
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(newTarget);
    if (!isNaN(val) && val > 0) {
      onUpdateTargetHours(val);
      setShowLogHours(false);
    }
  };

  // Day details for office presence
  const dayDetails: { [key: string]: { hours: string; status: string; location: string } } = {
    MON: { hours: "8.2 hrs", status: "VERIFIED", location: "Board Room Crystal" },
    TUE: { hours: "9.0 hrs", status: "VERIFIED", location: "Workspace Lab A" },
    WED: { hours: "8.5 hrs", status: "VERIFIED", location: "Workspace Lab B" },
    THU: { hours: "6.8 hrs", status: "ACTIVE RUNNING", location: "Main Headquarters" },
    FRI: { hours: "0.0 hrs", status: "NOT LOGGED", location: "Remote Standby" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
      {/* Weekly Hours Card */}
      <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-white/20 group hover:border-brand-primary/50 transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined p-3 bg-brand-primary/10 text-white rounded-2xl">
              schedule
            </span>
            <div>
              <span className="font-sans text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
                Time Matrix
              </span>
              <p className="text-[10px] text-brand-secondary">Weekly Target</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-sans text-[11px] text-neutral-400 font-medium block uppercase tracking-wider">
              Logged Hours
            </span>
            <p className="font-sans text-2xl font-black text-white leading-none mt-1">
              {profile.completedHours.toFixed(1)} <span className="text-neutral-500 text-sm font-normal">/ {profile.weeklyTargetHours}</span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="h-2 w-full bg-[#1a1c1c] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full shadow-[0_0_10px_rgba(76,215,246,0.5)] transition-all duration-500"
              style={{ width: `${completedPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 items-center">
            <span className="font-mono text-[10px] font-bold text-neutral-400 tracking-wider">
              {completedPercent}% COMPLETED
            </span>
            <span className="font-mono text-[10px] font-bold text-brand-secondary tracking-wider">
              +2.4h vs LW
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 border-t border-white/5 pt-3 justify-end">
          <button
            onClick={() => setShowLogHours(!showLogHours)}
            className="flex items-center gap-1 text-[10px] font-bold text-brand-secondary bg-brand-secondary/10 px-2.5 py-1.5 rounded-lg border border-brand-secondary/20 hover:bg-brand-secondary/20 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Settings className="w-3 h-3" />
            Configure Matrix
          </button>
        </div>

        {/* Floating manual matrix configure sheet */}
        {showLogHours && (
          <div className="absolute inset-0 bg-[#0a0e1a]/95 backdrop-blur-xl z-20 p-5 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-secondary" />
                Configure Matrix Target
              </h4>
              <button
                onClick={() => setShowLogHours(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 my-2">
              <form onSubmit={handleAddHours} className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">
                  Log Additional Overtime Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="16"
                    value={hoursToAdd}
                    onChange={(e) => setHoursToAdd(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-brand-secondary text-[#121414] font-bold text-xs px-3 rounded-lg flex items-center gap-1 hover:bg-opacity-90 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Log
                  </button>
                </div>
              </form>

              <form onSubmit={handleSaveTarget} className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wide">
                  Adjust Weekly Goal Target
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="40"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white py-1.5 px-3 focus:border-brand-secondary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-white/10 border border-white/15 text-white font-bold text-xs px-3 rounded-lg hover:bg-white/20 active:scale-95 transition-all"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>

            <p className="text-[9px] text-neutral-500 leading-tight">
              Adjustments write to physical memory storage and are automatically recalibrated inside telemetry sensors.
            </p>
          </div>
        )}
      </div>

      {/* Presence Stats Card */}
      <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-white/20 group hover:border-brand-secondary/50 transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined p-3 bg-brand-secondary/10 text-brand-secondary rounded-2xl">
              location_on
            </span>
            <div>
              <span className="font-sans text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
                Office Presence
              </span>
              <p className="text-[10px] text-brand-secondary">Signal Intensity</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-sans text-[11px] text-neutral-400 font-medium block uppercase tracking-wider">
              Attendance
            </span>
            <p className="font-sans text-2xl font-black text-white leading-none mt-1">
              94%
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Days Columns */}
        <div className="mt-6 flex gap-2 justify-between">
          {ATTENDANCE_WEEKDAY_BARS.map((bar) => {
            const isSel = selectedDay === bar.day;
            return (
              <button
                key={bar.day}
                onClick={() => setSelectedDay(bar.day)}
                className={`flex-1 py-2 glass-card rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:border-brand-secondary/40 cursor-pointer ${
                  bar.disabled ? "opacity-30" : ""
                } ${isSel ? "border-brand-secondary/50 bg-brand-secondary/10" : "border-white/5"}`}
              >
                <span className={`font-mono text-[9px] font-bold ${
                  isSel ? "text-brand-secondary" : "text-neutral-400"
                }`}>
                  {bar.day}
                </span>
                <div className="h-8 flex items-end mt-1.5 w-full justify-center">
                  {bar.heightPercent > 0 ? (
                    <div
                      className={`w-1 rounded-full transition-all duration-500 ${
                        isSel 
                          ? "bg-brand-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)] h-6 animate-pulse" 
                          : "bg-neutral-500"
                      }`}
                      style={{ height: `${Math.max(4, bar.heightPercent / 3)}px` }}
                    />
                  ) : (
                    <div className="w-1 h-1 bg-neutral-700 rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Daily Details Summary panel */}
        <div className="mt-4 border-t border-white/5 pt-3 flex justify-between items-center text-[10px]">
          {selectedDay ? (
            <>
              <span className="text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_4px_#4cd7f6]" />
                {selectedDay}: {dayDetails[selectedDay].hours}
              </span>
              <span className="text-neutral-500 font-mono text-[9px] tracking-tight truncate max-w-[150px]">
                {dayDetails[selectedDay].location}
              </span>
            </>
          ) : (
            <span className="text-neutral-500">Select any workday column above.</span>
          )}
        </div>
      </div>
    </div>
  );
}
