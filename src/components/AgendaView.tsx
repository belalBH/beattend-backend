import { useState } from "react";
import { Engagement } from "../types";
import { Search, Calendar, MapPin, Clock, ArrowUpDown, Filter, ChevronRight, AlertCircle } from "lucide-react";

interface AgendaViewProps {
  engagements: Engagement[];
  onSelect: (engagement: Engagement) => void;
}

export default function AgendaView({ engagements, onSelect }: AgendaViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filtered = engagements
    .filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = filterType === "ALL" || e.type === filterType;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold">Comprehensive Schedule</p>
        <h2 className="text-2xl font-black text-white">Security Agenda Ledger</h2>
      </div>

      {/* Control panel */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search meetings, venue matrix..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 focus:border-brand-secondary focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 flex-1 md:flex-none">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-[11px] font-semibold border-none focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              <option value="ALL" className="bg-[#121414]">ALL MODES</option>
              <option value="INTERNAL" className="bg-[#121414]">INTERNAL</option>
              <option value="STRATEGIC" className="bg-[#121414]">STRATEGIC</option>
              <option value="CLIENT" className="bg-[#121414]">CLIENT</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-300 cursor-pointer transition-all"
            title="Toggle Sorting Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {sortOrder === "asc" ? "OLDEST" : "NEWEST"}
            </span>
          </button>
        </div>
      </div>

      {/* Agenda list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="w-8 h-8 text-neutral-600 animate-bounce" />
            <p className="text-sm text-neutral-400 font-sans">No matching engagements found.</p>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Ledger is empty for selection</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-secondary/40 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-900 border border-white/10 rounded-xl flex flex-col items-center justify-center font-sans">
                  <span className="text-xs font-black text-brand-primary leading-none">
                    {item.rawDate.split(" ")[0]}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">
                    {item.rawDate.split(" ")[1]}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-secondary transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-400 mt-1 items-center">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {item.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      {item.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                  item.type === "STRATEGIC" 
                    ? "bg-rose-500/10 border border-rose-500/25 text-rose-400" 
                    : item.type === "INTERNAL" 
                    ? "bg-brand-primary/10 border border-brand-primary/20 text-brand-primary"
                    : "bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary"
                }`}>
                  {item.type}
                </span>

                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-all group-hover:translate-x-0.5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
