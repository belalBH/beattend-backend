import { useState, useEffect } from "react";
import { CheckInLog, Profile } from "../types";
import { LogIn, LogOut, RefreshCw, KeyRound, Clock } from "lucide-react";

interface CheckInCardProps {
  checkedIn: boolean;
  onToggleCheckIn: (method: "Fingerprint" | "NFC" | "Manual Override") => void;
  checkInTime: string | null;
  logs: CheckInLog[];
  profile: Profile;
}

export default function CheckInCard({
  checkedIn,
  onToggleCheckIn,
  checkInTime,
  logs,
  profile,
}: CheckInCardProps) {
  const [timeLeft, setTimeLeft] = useState("07:15:30");
  const [logsOpen, setLogsOpen] = useState(false);
  const [method, setMethod] = useState<"Fingerprint" | "NFC" | "Manual Override">("Fingerprint");

  // Simulate a realistic shift timer decrementing when checked in
  useEffect(() => {
    let interval: any = null;
    if (checkedIn) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const parts = prev.split(":").map(Number);
          let seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          if (seconds <= 0) return "00:00:00";
          seconds--;
          const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
          const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
          const s = (seconds % 60).toString().padStart(2, "0");
          return `${h}:${m}:${s}`;
        });
      }, 1000);
    } else {
      setTimeLeft("07:15:30");
    }
    return () => clearInterval(interval);
  }, [checkedIn]);

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent pointer-events-none"></div>
      
      {/* Small top label */}
      <h3 className="font-sans text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-8 z-10 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-brand-secondary animate-pulse" />
        Current Session
      </h3>

      {/* Circle Orb Container */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Glow Rings (Animated custom shadows and sizes to match premium design) */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          checkedIn ? "animate-pulse-glow opacity-30 bg-brand-secondary/20" : "opacity-0"
        }`} />
        <div className={`absolute -inset-4 rounded-full border border-white/5 transition-all duration-1000 ${
          checkedIn ? "animate-pulse-glow border-brand-secondary/20" : "opacity-0"
        }`} style={{ animationDelay: "1s" }} />
        <div className={`absolute -inset-8 rounded-full border border-white/5 transition-all duration-1000 ${
          checkedIn ? "animate-pulse-glow border-brand-secondary/10" : "opacity-0"
        }`} style={{ animationDelay: "2s" }} />

        {/* The Main Circular Button */}
        <button
          onClick={() => onToggleCheckIn(method)}
          className={`relative w-48 h-48 rounded-full bg-gradient-to-tr p-1 shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 group/btn cursor-pointer ${
            checkedIn 
              ? "from-rose-500 to-amber-500 shadow-rose-950/20" 
              : "from-brand-primary/80 to-brand-secondary shadow-brand-secondary/10"
          }`}
        >
          <div className="w-full h-full rounded-full bg-[#0c0f0f] flex flex-col items-center justify-center overflow-hidden transition-all group-hover/btn:bg-opacity-90">
            {/* Holographic scanning overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-secondary/10 to-transparent w-full h-1/2 animate-bounce pointer-events-none opacity-40" />

            <span className={`material-symbols-outlined text-5xl mb-1 transition-all duration-500 ${
              checkedIn ? "text-rose-400 rotate-180" : "text-brand-secondary"
            }`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {checkedIn ? "logout" : "fingerprint"}
            </span>

            <span className={`font-sans text-lg font-bold tracking-tight transition-colors duration-500 ${
              checkedIn ? "text-rose-400" : "text-brand-secondary"
            }`}>
              {checkedIn ? "Check Out" : "Check In"}
            </span>
            
            <p className="font-mono text-xs text-neutral-400 mt-2 font-medium">
              {checkedIn ? `In: ${checkInTime || "08:45 AM"}` : "08:45 AM"}
            </p>
          </div>
        </button>
      </div>

      {/* Dynamic Subtitle Info */}
      <div className="mt-8 text-center z-10">
        {checkedIn ? (
          <p className="font-sans text-sm text-neutral-300">
            Shift ends in <span className="text-brand-secondary font-bold font-mono tracking-wide">{timeLeft}</span>
          </p>
        ) : (
          <p className="font-sans text-sm text-neutral-400">
            Session is currently <span className="text-neutral-500 font-semibold font-mono">STANDBY</span>
          </p>
        )}
      </div>

      {/* Verification Method Picker / Log view switcher */}
      <div className="mt-6 flex gap-2 z-10 w-full px-4 justify-between items-center pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Method:</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg text-[10px] text-neutral-300 font-medium py-1 px-2 focus:border-brand-secondary focus:outline-none cursor-pointer"
          >
            <option value="Fingerprint" className="bg-[#121414]">Fingerprint</option>
            <option value="NFC" className="bg-[#121414]">Mobile NFC</option>
            <option value="Manual Override" className="bg-[#121414]">Credentials</option>
          </select>
        </div>

        <button
          onClick={() => setLogsOpen(!logsOpen)}
          className="text-[10px] text-brand-secondary hover:underline flex items-center gap-1 cursor-pointer font-semibold uppercase tracking-wider"
        >
          <RefreshCw className="w-3 h-3" />
          {logsOpen ? "Hide Logs" : `Logs (${logs.length})`}
        </button>
      </div>

      {/* Expanding Real-time Logs List */}
      {logsOpen && (
        <div className="absolute inset-0 bg-[#0a0e1a]/95 backdrop-blur-xl z-20 p-6 flex flex-col justify-start animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
            <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-brand-secondary" />
              Access Log Ledger
            </h4>
            <button
              onClick={() => setLogsOpen(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                No logs recorded yet in this session.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      log.type === "check-in" 
                        ? "bg-brand-secondary shadow-[0_0_6px_rgba(76,215,246,0.6)]" 
                        : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                    }`} />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wide">
                        {log.type === "check-in" ? "Clock In" : "Clock Out"}
                      </p>
                      <p className="text-[10px] text-neutral-400">Via {log.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-white">{log.timestamp}</p>
                    <p className="text-[9px] text-neutral-500">{log.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
