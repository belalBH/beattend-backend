import React, { useState } from "react";
import { Engagement } from "../types";
import { Calendar, Plus, MapPin, Clock, Users, ArrowRight, Trash2, CalendarDays } from "lucide-react";

interface EngagementsCardProps {
  engagements: Engagement[];
  onAddEngagement: (newEng: Omit<Engagement, "id">) => void;
  onDeleteEngagement: (id: string) => void;
}

export default function EngagementsCard({
  engagements,
  onAddEngagement,
  onDeleteEngagement,
}: EngagementsCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEng, setSelectedEng] = useState<Engagement | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-10-16");
  const [time, setTime] = useState("09:00 AM");
  const [location, setLocation] = useState("Workspace Lab A");
  const [type, setType] = useState<Engagement["type"]>("INTERNAL");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Format date into standard raw display (e.g., "16 OCT")
    const d = new Date(date);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const rawDate = `${d.getDate()} ${months[d.getMonth()] || "OCT"}`;

    onAddEngagement({
      title,
      date,
      rawDate,
      time,
      location,
      type,
      status: type === "STRATEGIC" ? "error" : "active",
      attendees: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ALvywzdH-a_z-tjjQMal7BjnkKufjEWf-x_WTFgoYZgkBMnzVx258INR1F00mknAUAdX4RmHA8I5uAVLaYPWU0ELFU8VOlePhS6CLO0eHtDF6jr7PoRbE7uRNm7eUcWWcKZhGA9IabRhKqs5NqOcG95PFvPpJdlr97EYXnc_w69yc512KygYumKfCDTX3GIHxmxFtMEgVgeCqOo4PENX6p7pUFZNWG8JGnnCK4GQZAF5IgUhiTxc2BapyvloRZ31lLl590J2QTU"
      ],
      description: description || "Corporate engagement, alignment and deliverables review.",
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setShowAddForm(false);
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/10 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-sans text-lg font-bold text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-brand-secondary" />
          Next Engagements
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-brand-secondary font-sans text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg px-2.5 py-1.5 hover:bg-brand-secondary/20 transition-all uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Event
        </button>
      </div>

      <div className="space-y-4">
        {engagements.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500 font-sans">
            No engagements scheduled. Add one using the button above.
          </div>
        ) : (
          engagements.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedEng(item)}
              className="flex items-center gap-4 p-4 glass-card rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center w-14 h-14 glass-card rounded-xl border border-white/10 group-hover:bg-brand-primary/10 transition-colors">
                <span className="font-sans text-sm font-black text-brand-primary">
                  {item.rawDate.split(" ")[0]}
                </span>
                <span className="font-mono text-[9px] font-bold text-neutral-400">
                  {item.rawDate.split(" ")[1]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans text-sm font-bold text-white truncate group-hover:text-brand-secondary transition-colors">
                  {item.title}
                </h4>
                <p className="font-sans text-xs text-neutral-400 mt-1 truncate flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  {item.time} • {item.location}
                </p>
              </div>

              {/* Badges / Avatars / Status indicator */}
              <div className="flex items-center gap-3">
                {item.type === "INTERNAL" && (
                  <span className="hidden sm:inline-block px-2.5 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary font-mono text-[9px] font-semibold tracking-wider uppercase">
                    INTERNAL
                  </span>
                )}
                {item.type === "STRATEGIC" && (
                  <span className="hidden sm:inline-block px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 font-mono text-[9px] font-semibold tracking-wider uppercase">
                    STRATEGIC
                  </span>
                )}

                {/* Overlapped avatars */}
                <div className="flex -space-x-2">
                  {item.attendees.map((avatar, idx) => (
                    <div
                      key={idx}
                      className="w-7 h-7 rounded-full border-2 border-[#121414] bg-neutral-800 overflow-hidden"
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={avatar}
                        alt="Attendee"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>

                {/* Status Dot */}
                <span
                  className={`w-2 h-2 rounded-full ml-1 ${
                    item.status === "error"
                      ? "bg-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
                      : "bg-brand-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)]"
                  }`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide overlay for adding new Engagement */}
      {showAddForm && (
        <div className="absolute inset-0 bg-[#0c0f0f]/95 backdrop-blur-xl z-20 p-6 flex flex-col justify-between rounded-3xl animate-in fade-in slide-in-from-right-10 duration-300">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-secondary" />
              Schedule Engagement
            </h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-3 my-4 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                Engagement Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q1 Technical Roadmap Sync"
                className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3.5 focus:border-brand-secondary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Session Time
                </label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g., 03:30 PM"
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Location Matrix
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Zoom / HQ-Room 4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                  Engagement Mode
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3 focus:border-brand-secondary focus:outline-none"
                >
                  <option value="INTERNAL" className="bg-[#121414]">INTERNAL</option>
                  <option value="CLIENT" className="bg-[#121414]">CLIENT</option>
                  <option value="STRATEGIC" className="bg-[#121414]">STRATEGIC</option>
                  <option value="OTHER" className="bg-[#121414]">OTHER</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 font-bold uppercase block tracking-wider">
                Strategic Brief Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key deliverables, core audience, and strategic milestones..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl text-xs text-white py-2 px-3.5 focus:border-brand-secondary focus:outline-none"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 border border-white/10 hover:bg-white/5 text-neutral-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-brand-secondary text-[#121414] font-bold text-xs py-2 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              >
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Engagement details Modal Sheet */}
      {selectedEng && (
        <div className="absolute inset-0 bg-[#0a0e1a]/95 backdrop-blur-xl z-20 p-6 flex flex-col justify-between rounded-3xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-[10px] bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              {selectedEng.type}
            </span>
            <button
              onClick={() => setSelectedEng(null)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 my-4 space-y-4 overflow-y-auto pr-1">
            <div>
              <h4 className="text-base font-bold text-white tracking-tight">{selectedEng.title}</h4>
              <p className="text-[10px] text-neutral-400 font-mono mt-1 font-semibold">
                ID Reference: ENG-{selectedEng.id}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span>Date: {selectedEng.date} ({selectedEng.rawDate})</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span>Time Duration: {selectedEng.time}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>Venue Matrix: {selectedEng.location}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-3">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">
                Session Strategic Objectives
              </span>
              <p className="text-xs text-neutral-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                {selectedEng.description}
              </p>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-3">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">
                Attendees Verified ({selectedEng.attendees.length})
              </span>
              <div className="flex gap-2">
                {selectedEng.attendees.map((avatar, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full pr-3.5 pl-1 py-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src={avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] text-neutral-300 font-medium font-sans">
                      {idx === 0 ? "You (Alex)" : "Co-Investor"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-white/5 pt-4">
            <button
              onClick={() => {
                onDeleteEngagement(selectedEng.id);
                setSelectedEng(null);
              }}
              className="flex-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4" />
              Cancel Event
            </button>
            <button
              onClick={() => setSelectedEng(null)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              Back to Agenda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
