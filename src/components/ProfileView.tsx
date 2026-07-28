import React, { useState } from "react";
import { Profile } from "../types";
import { ShieldCheck, User, ShieldAlert, Cpu, Check, Settings, Save, AlertCircle } from "lucide-react";

interface ProfileViewProps {
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
}

export default function ProfileView({ profile, onUpdateProfile }: ProfileViewProps) {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [targetHours, setTargetHours] = useState(profile.weeklyTargetHours.toString());
  const [status, setStatus] = useState(profile.officeStatus);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    onUpdateProfile({
      ...profile,
      name,
      role,
      weeklyTargetHours: parseInt(targetHours) || 40,
      officeStatus: status,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold font-mono">System Identity Panel</p>
        <h2 className="text-2xl font-black text-white">Profile & Security Diagnostics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card / Config form */}
        <div className="lg:col-span-8 glass-card p-6 rounded-3xl border border-white/10 relative">
          <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-secondary" />
            Identity settings configuration
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Full Name Matrix
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Assigned Title / Role
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Weekly Goal Capacity (hours)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="80"
                  value={targetHours}
                  onChange={(e) => setTargetHours(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Default Telemetry Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE" className="bg-[#121414]">ACTIVE (ON-PREMISE)</option>
                  <option value="REMOTE" className="bg-[#121414]">REMOTE (VPN SECURITY)</option>
                  <option value="OUT_OF_OFFICE" className="bg-[#121414]">OUT OF OFFICE (STANDBY)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] text-neutral-500 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                All changes commit directly to the secure browser sandbox.
              </span>
              
              <button
                type="submit"
                className="bg-brand-secondary text-[#121414] font-bold text-xs py-2 px-6 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    Committed
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Commit Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Diagnostic parameters side card */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-secondary" />
              Security Diagnostics
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                <div>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Authentication Core</p>
                  <p className="text-xs text-neutral-200 font-semibold mt-0.5">SHA-256 Protocol</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                <div>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Biometric Sensor</p>
                  <p className="text-xs text-neutral-200 font-semibold mt-0.5">Capacitive Scanner</p>
                </div>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  ONLINE
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                <div>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Local VPN Routing</p>
                  <p className="text-xs text-neutral-200 font-semibold mt-0.5">Isolated Encrypted Node</p>
                </div>
                <span className="text-[10px] bg-brand-secondary/15 border border-brand-secondary/25 text-brand-secondary px-2 py-0.5 rounded-full font-mono font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[9px] text-neutral-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Terminal status is fully synchronized. No active threats detected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
